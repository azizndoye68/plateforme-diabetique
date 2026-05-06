package sn.diabete.communication.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import sn.diabete.communication.client.MedecinServiceClient;
import sn.diabete.communication.client.PatientServiceClient;
import sn.diabete.communication.dto.*;
import sn.diabete.communication.entity.Conversation;
import sn.diabete.communication.entity.ConversationType;
import sn.diabete.communication.entity.SenderType;
import sn.diabete.communication.repository.ConversationRepository;
import sn.diabete.communication.service.ChatWebSocketService;
import sn.diabete.communication.service.MessageService;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final MessageService messageService;
    private final ChatWebSocketService chatWebSocketService;
    private final ConversationRepository conversationRepository;
    private final MedecinServiceClient medecinServiceClient;
    private final PatientServiceClient patientServiceClient;

    /**
     * Recevoir et traiter message via WebSocket
     * Endpoint: /app/chat.send
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request) {
        log.info("WebSocket: Message reçu pour conversation {}", request.getConversationId());

        try {
            // Sauvegarder message
            MessageDTO message = messageService.saveMessage(request);

            // Récupérer conversation
            Conversation conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));

            // Envoyer via WebSocket selon type conversation
            if (conversation.getType() == ConversationType.PATIENT_EQUIPE) {
                handlePatientEquipeMessage(conversation, message);
            } else if (conversation.getType() == ConversationType.MEDECIN_MEDECIN) {
                handleMedecinMedecinMessage(conversation, message);
            }

        } catch (Exception e) {
            log.error("Erreur traitement message WebSocket", e);
        }
    }

    /**
     * Gérer message PATIENT_EQUIPE
     */
    private void handlePatientEquipeMessage(Conversation conversation, MessageDTO message) {
        try {
            if (message.getSenderType() == SenderType.PATIENT) {
                // Patient envoie → notifier tous les médecins de l'équipe
                EquipeMedicaleDTO equipe = medecinServiceClient.getEquipeMedicale(
                        conversation.getMedecinReferentId()
                );

                // Envoyer au médecin référent
                chatWebSocketService.sendToMedecin(equipe.getProprietaireId(), message);

                // Envoyer à tous les membres de l'équipe
                for (MembreEquipeDTO membre : equipe.getMembres()) {
                    chatWebSocketService.sendToMedecin(membre.getId(), message);
                }

                log.info("Message patient diffusé à {} médecins", equipe.getMembres().size() + 1);

            } else {
                // Médecin répond → notifier patient + autres médecins
                chatWebSocketService.sendToPatient(conversation.getPatientId(), message);

                // Optionnel: notifier autres médecins de l'équipe
                EquipeMedicaleDTO equipe = medecinServiceClient.getEquipeMedicale(
                        conversation.getMedecinReferentId()
                );

                for (MembreEquipeDTO membre : equipe.getMembres()) {
                    if (!membre.getId().equals(message.getSenderId())) {
                        chatWebSocketService.sendToMedecin(membre.getId(), message);
                    }
                }

                // Médecin référent
                if (!equipe.getProprietaireId().equals(message.getSenderId())) {
                    chatWebSocketService.sendToMedecin(equipe.getProprietaireId(), message);
                }

                log.info("Réponse médecin envoyée au patient et équipe");
            }

        } catch (Exception e) {
            log.error("Erreur envoi message PATIENT_EQUIPE", e);
        }
    }

    /**
     * Gérer message MEDECIN_MEDECIN
     */
    private void handleMedecinMedecinMessage(Conversation conversation, MessageDTO message) {
        try {
            // Déterminer destinataire
            Long recipientId = conversation.getMedecinId1().equals(message.getSenderId())
                    ? conversation.getMedecinId2()
                    : conversation.getMedecinId1();

            // Envoyer au destinataire
            chatWebSocketService.sendToMedecin(recipientId, message);

            log.info("Message médecin-médecin envoyé à médecin {}", recipientId);

        } catch (Exception e) {
            log.error("Erreur envoi message MEDECIN_MEDECIN", e);
        }
    }

    /**
     * Gérer indicateur "en train d'écrire"
     * Endpoint: /app/chat.typing
     */
    @MessageMapping("/chat.typing")
    public void handleTypingIndicator(@Payload TypingIndicatorRequest request) {
        log.debug("Typing indicator: conversation {}, user {}, typing: {}",
                request.getConversationId(), request.getUserId(), request.isTyping());

        try {
            chatWebSocketService.sendTypingIndicator(
                    request.getConversationId(),
                    request.getUserId(),
                    request.getUserName(),
                    request.isTyping()
            );
        } catch (Exception e) {
            log.error("Erreur envoi typing indicator", e);
        }
    }

    // Classe pour indicateur typing
    @lombok.Data
    public static class TypingIndicatorRequest {
        private Long conversationId;
        private Long userId;
        private String userName;
        private boolean typing;
    }
}