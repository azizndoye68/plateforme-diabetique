package sn.diabete.communication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.diabete.communication.client.MedecinServiceClient;
import sn.diabete.communication.client.PatientServiceClient;
import sn.diabete.communication.dto.*;
import sn.diabete.communication.entity.*;
import sn.diabete.communication.repository.ConversationRepository;
import sn.diabete.communication.repository.MessageRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final PatientServiceClient patientServiceClient;
    private final MedecinServiceClient medecinServiceClient;

    @Transactional
    public Conversation getOrCreatePatientConversation(Long patientId) {
        log.info("Récupération/création conversation pour patient {}", patientId);

        List<Conversation> existing = conversationRepository
                .findByPatientIdAndType(patientId, ConversationType.PATIENT_EQUIPE);

        if (!existing.isEmpty()) {
            if (existing.size() > 1) {
                log.warn("⚠️ {} doublons détectés pour patient {}, nettoyage...",
                        existing.size(), patientId);
                existing.sort(Comparator.comparing(Conversation::getId));
                List<Conversation> toDelete = existing.subList(1, existing.size());
                conversationRepository.deleteAll(toDelete);
                conversationRepository.flush();
            }
            return existing.get(0);
        }

        PatientInfoDTO patient = patientServiceClient.getPatientById(patientId);

        if (patient.getMedecinId() == null) {
            throw new RuntimeException("Patient sans médecin référent");
        }

        Conversation conversation = Conversation.builder()
                .type(ConversationType.PATIENT_EQUIPE)
                .patientId(patientId)
                .medecinReferentId(patient.getMedecinId())
                .status(ConversationStatus.ACTIVE)
                .build();

        return conversationRepository.save(conversation);
    }

    @Transactional
    public Conversation getOrCreateMedecinConversation(Long medecinId1, Long medecinId2) {
        log.info("Récupération/création conversation entre médecins {} et {}", medecinId1, medecinId2);

        return conversationRepository
                .findConversationBetweenMedecins(medecinId1, medecinId2, ConversationType.MEDECIN_MEDECIN)
                .orElseGet(() -> {
                    Conversation conversation = Conversation.builder()
                            .type(ConversationType.MEDECIN_MEDECIN)
                            .medecinId1(medecinId1)
                            .medecinId2(medecinId2)
                            .status(ConversationStatus.ACTIVE)
                            .build();
                    return conversationRepository.save(conversation);
                });
    }

    public List<ConversationDTO> getPatientConversations(Long patientId) {
        log.info("Récupération conversations patient {}", patientId);

        List<Conversation> conversations = conversationRepository
                .findByPatientIdAndStatus(patientId, ConversationStatus.ACTIVE);

        return conversations.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ConversationDTO> getMedecinConversations(Long medecinId) {
        log.info("Récupération conversations médecin {}", medecinId);

        List<ConversationDTO> allConversations = new ArrayList<>();

        List<Conversation> patientConversations = conversationRepository
                .findByMedecinReferentIdAndTypeAndStatus(
                        medecinId,
                        ConversationType.PATIENT_EQUIPE,
                        ConversationStatus.ACTIVE
                );

        allConversations.addAll(
                patientConversations.stream()
                        .map(this::mapToDTO)
                        .collect(Collectors.toList())
        );

        List<Conversation> medecinConversations = conversationRepository
                .findMedecinConversations(medecinId, ConversationType.MEDECIN_MEDECIN, ConversationStatus.ACTIVE);

        allConversations.addAll(
                medecinConversations.stream()
                        .map(conv -> mapMedecinConversationToDTO(conv, medecinId))
                        .collect(Collectors.toList())
        );

        return allConversations;
    }

    public ConversationDTO getConversationById(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));
        return mapToDTO(conversation);
    }

    public boolean canMedecinAccessConversation(Long medecinId, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElse(null);

        if (conversation == null) return false;

        if (conversation.getType() == ConversationType.PATIENT_EQUIPE) {
            try {
                return medecinServiceClient.canAccessPatient(medecinId, conversation.getPatientId());
            } catch (Exception e) {
                log.error("Erreur vérification accès médecin", e);
                return false;
            }
        } else if (conversation.getType() == ConversationType.MEDECIN_MEDECIN) {
            return conversation.getMedecinId1().equals(medecinId) ||
                    conversation.getMedecinId2().equals(medecinId);
        }

        return false;
    }

    private ConversationDTO mapToDTO(Conversation conversation) {
        ConversationDTO dto = ConversationDTO.builder()
                .id(conversation.getId())
                .type(conversation.getType())
                .status(conversation.getStatus())
                .lastMessageAt(conversation.getLastMessageAt())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();

        messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId())
                .ifPresent(message -> {
                    MessageDTO messageDTO = MessageDTO.builder()
                            .id(message.getId())
                            .content(message.getContent())
                            .senderType(message.getSenderType())
                            .createdAt(message.getCreatedAt())
                            .build();
                    dto.setLastMessage(messageDTO);
                });

        if (conversation.getType() == ConversationType.PATIENT_EQUIPE) {
            enrichPatientConversation(dto, conversation);
        }

        return dto;
    }

    private ConversationDTO mapMedecinConversationToDTO(Conversation conversation, Long currentMedecinId) {
        ConversationDTO dto = mapToDTO(conversation);

        Long otherMedecinId = conversation.getMedecinId1().equals(currentMedecinId)
                ? conversation.getMedecinId2()
                : conversation.getMedecinId1();

        try {
            MedecinInfoDTO medecinInfo = medecinServiceClient.getMedecinById(otherMedecinId);
            dto.setOtherMedecinId(otherMedecinId);
            dto.setOtherMedecinName("Dr. " + medecinInfo.getPrenom() + " " + medecinInfo.getNom());
        } catch (Exception e) {
            log.error("Erreur récupération infos médecin {}", otherMedecinId, e);
            dto.setOtherMedecinName("Médecin #" + otherMedecinId);
        }

        return dto;
    }

    private void enrichPatientConversation(ConversationDTO dto, Conversation conversation) {
        try {
            PatientInfoDTO patient = patientServiceClient.getPatientById(conversation.getPatientId());
            dto.setPatientId(patient.getId());
            dto.setPatientName(patient.getPrenom() + " " + patient.getNom());

            EquipeMedicaleDTO equipe = medecinServiceClient.getEquipeMedicale(conversation.getMedecinReferentId());
            dto.setMedecinReferentId(equipe.getProprietaireId());

            List<ParticipantDTO> participants = new ArrayList<>();
            for (MembreEquipeDTO membre : equipe.getMembres()) {
                participants.add(ParticipantDTO.builder()
                        .id(membre.getId())
                        .nom(membre.getNom())
                        .prenom(membre.getPrenom())
                        .specialite(membre.getSpecialite())
                        .type("MEDECIN")
                        .build());
            }
            dto.setParticipants(participants);

        } catch (Exception e) {
            log.error("Erreur enrichissement conversation", e);
        }
    }
}