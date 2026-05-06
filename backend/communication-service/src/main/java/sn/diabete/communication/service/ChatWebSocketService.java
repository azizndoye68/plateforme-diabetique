package sn.diabete.communication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import sn.diabete.communication.dto.MessageDTO;
import sn.diabete.communication.entity.SenderType;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Envoyer message WebSocket à un patient
     */
    public void sendToPatient(Long patientId, MessageDTO message) {
        String destination = "/topic/patient/" + patientId + "/messages";
        messagingTemplate.convertAndSend(destination, message);
        log.debug("Message envoyé au patient {} via {}", patientId, destination);
    }

    /**
     * Envoyer message WebSocket à un médecin
     */
    public void sendToMedecin(Long medecinId, MessageDTO message) {
        String destination = "/topic/medecin/" + medecinId + "/messages";
        messagingTemplate.convertAndSend(destination, message);
        log.debug("Message envoyé au médecin {} via {}", medecinId, destination);
    }

    /**
     * Broadcaster un message à tous les participants
     */
    public void broadcastMessage(Long conversationId, MessageDTO message) {
        String destination = "/topic/conversation/" + conversationId;
        messagingTemplate.convertAndSend(destination, message);
        log.debug("Message broadcasté sur conversation {}", conversationId);
    }

    /**
     * Envoyer indicateur "en train d'écrire"
     */
    public void sendTypingIndicator(Long conversationId, Long userId, String userName, boolean isTyping) {
        String destination = "/topic/conversation/" + conversationId + "/typing";

        TypingIndicator indicator = new TypingIndicator(userId, userName, isTyping);
        messagingTemplate.convertAndSend(destination, indicator);
    }

    // Classe interne pour indicateur
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class TypingIndicator {
        private Long userId;
        private String userName;
        private boolean isTyping;
    }
}