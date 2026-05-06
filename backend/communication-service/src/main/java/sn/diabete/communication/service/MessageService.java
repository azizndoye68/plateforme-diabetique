// ============================================================
// MessageService.java
// ============================================================
package sn.diabete.communication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.diabete.communication.client.MedecinServiceClient;
import sn.diabete.communication.client.PatientServiceClient;
import sn.diabete.communication.dto.*;
import sn.diabete.communication.entity.*;
import sn.diabete.communication.repository.ConversationRepository;
import sn.diabete.communication.repository.MessageRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final PatientServiceClient patientServiceClient;
    private final MedecinServiceClient medecinServiceClient;
    private final NotificationPublisher notificationPublisher;

    /**
     * Enregistrer un nouveau message
     */
    @Transactional
    public MessageDTO saveMessage(ChatMessageRequest request) {
        log.info("Enregistrement message conversation {}", request.getConversationId());

        // Vérifier que la conversation existe
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));

        // Créer le message
        Message message = Message.builder()
                .conversationId(request.getConversationId())
                .senderId(request.getSenderId())
                .senderType(SenderType.valueOf(request.getSenderType()))
                .content(request.getContent())
                .messageType(request.getMessageType())
                .build();

        message = messageRepository.save(message);

        // Mettre à jour lastMessageAt de la conversation
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Convertir en DTO
        MessageDTO messageDTO = mapToDTO(message);

        // Envoyer notifications
        sendNotifications(conversation, messageDTO);

        return messageDTO;
    }

    /**
     * Récupérer messages d'une conversation (paginé)
     */
    public Page<MessageDTO> getConversationMessages(Long conversationId, int page, int size) {
        log.info("Récupération messages conversation {} - page {}", conversationId, page);

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(
                conversationId,
                pageable
        );

        return messages.map(this::mapToDTO);
    }

    /**
     * Sauvegarder message avec fichier
     */
    @Transactional
    public MessageDTO saveMessageWithFile(Long conversationId, Long senderId, String senderType,
                                          String content, String fileName, String fileUrl, Long fileSize) {
        log.info("Enregistrement message avec fichier - conversation {}", conversationId);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));

        Message message = Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .senderType(SenderType.valueOf(senderType))
                .content(content)
                .messageType(MessageType.DOCUMENT)
                .fileName(fileName)
                .fileUrl(fileUrl)
                .fileSize(fileSize)
                .build();

        message = messageRepository.save(message);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageDTO messageDTO = mapToDTO(message);
        sendNotifications(conversation, messageDTO);

        return messageDTO;
    }

    /**
     * Envoyer notifications pour nouveau message
     */
    private void sendNotifications(Conversation conversation, MessageDTO messageDTO) {
        try {
            if (conversation.getType() == ConversationType.PATIENT_EQUIPE) {
                sendPatientEquipeNotifications(conversation, messageDTO);
            } else if (conversation.getType() == ConversationType.MEDECIN_MEDECIN) {
                sendMedecinMedecinNotifications(conversation, messageDTO);
            }
        } catch (Exception e) {
            log.error("Erreur envoi notifications", e);
        }
    }

    /**
     * Notifications pour conversation PATIENT_EQUIPE
     */
    private void sendPatientEquipeNotifications(Conversation conversation, MessageDTO messageDTO) {
        if (messageDTO.getSenderType() == SenderType.PATIENT) {
            // Patient envoie → notifier tous les médecins de l'équipe
            try {
                EquipeMedicaleDTO equipe = medecinServiceClient.getEquipeMedicale(conversation.getMedecinReferentId());
                PatientInfoDTO patient = patientServiceClient.getPatientById(conversation.getPatientId());

                List<Long> medecinIds = equipe.getMembres().stream()
                        .map(MembreEquipeDTO::getId)
                        .collect(Collectors.toList());

                // Ajouter médecin référent
                if (!medecinIds.contains(equipe.getProprietaireId())) {
                    medecinIds.add(equipe.getProprietaireId());
                }

                NotificationMessageDTO notification = NotificationMessageDTO.builder()
                        .type("NEW_MESSAGE")
                        .recipientIds(medecinIds)
                        .recipientType("MEDECIN")
                        .senderName(patient.getPrenom() + " " + patient.getNom())
                        .messagePreview(messageDTO.getContent())
                        .conversationId(conversation.getId())
                        .timestamp(messageDTO.getCreatedAt())
                        .build();

                notificationPublisher.publishNotification(notification);

            } catch (Exception e) {
                log.error("Erreur notification équipe médicale", e);
            }

        } else {
            // Médecin répond → notifier patient + autres médecins
            try {
                PatientInfoDTO patient = patientServiceClient.getPatientById(conversation.getPatientId());
                MedecinInfoDTO medecin = medecinServiceClient.getMedecinById(messageDTO.getSenderId());

                // Notification au patient
                NotificationMessageDTO patientNotification = NotificationMessageDTO.builder()
                        .type("NEW_MESSAGE")
                        .recipientIds(List.of(patient.getId()))
                        .recipientType("PATIENT")
                        .senderName("Dr. " + medecin.getPrenom() + " " + medecin.getNom())
                        .messagePreview(messageDTO.getContent())
                        .conversationId(conversation.getId())
                        .timestamp(messageDTO.getCreatedAt())
                        .build();

                notificationPublisher.publishNotification(patientNotification);

            } catch (Exception e) {
                log.error("Erreur notification patient", e);
            }
        }
    }

    /**
     * Notifications pour conversation MEDECIN_MEDECIN
     */
    private void sendMedecinMedecinNotifications(Conversation conversation, MessageDTO messageDTO) {
        try {
            // Déterminer le destinataire
            Long recipientId = conversation.getMedecinId1().equals(messageDTO.getSenderId())
                    ? conversation.getMedecinId2()
                    : conversation.getMedecinId1();

            MedecinInfoDTO sender = medecinServiceClient.getMedecinById(messageDTO.getSenderId());

            NotificationMessageDTO notification = NotificationMessageDTO.builder()
                    .type("NEW_MESSAGE")
                    .recipientIds(List.of(recipientId))
                    .recipientType("MEDECIN")
                    .senderName("Dr. " + sender.getPrenom() + " " + sender.getNom())
                    .messagePreview(messageDTO.getContent())
                    .conversationId(conversation.getId())
                    .timestamp(messageDTO.getCreatedAt())
                    .build();

            notificationPublisher.publishNotification(notification);

        } catch (Exception e) {
            log.error("Erreur notification médecin-médecin", e);
        }
    }

    /**
     * Mapper Message vers DTO
     */
    private MessageDTO mapToDTO(Message message) {
        MessageDTO dto = MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .senderId(message.getSenderId())
                .senderType(message.getSenderType())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .fileName(message.getFileName())
                .fileUrl(message.getFileUrl())
                .fileSize(message.getFileSize())
                .createdAt(message.getCreatedAt())
                .build();

        // Enrichir avec nom expéditeur
        try {
            if (message.getSenderType() == SenderType.PATIENT) {
                PatientInfoDTO patient = patientServiceClient.getPatientById(message.getSenderId());
                dto.setSenderName(patient.getPrenom() + " " + patient.getNom());
            } else {
                MedecinInfoDTO medecin = medecinServiceClient.getMedecinById(message.getSenderId());
                dto.setSenderName("Dr. " + medecin.getPrenom() + " " + medecin.getNom());
            }
        } catch (Exception e) {
            log.error("Erreur récupération nom expéditeur", e);
            dto.setSenderName("Utilisateur #" + message.getSenderId());
        }

        return dto;
    }
}