package sn.diabete.notification.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import sn.diabete.notification.dto.ChatNotificationEvent;
import sn.diabete.notification.entity.NotificationHistory;
import sn.diabete.notification.enums.CanalNotification;
import sn.diabete.notification.enums.StatutNotification;
import sn.diabete.notification.enums.TypeAlerte;
import sn.diabete.notification.repository.NotificationHistoryRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatNotificationListener {
    private final NotificationHistoryRepository historyRepository;

    @RabbitListener(queues = "${rabbitmq.queue.chat:chat.notification.queue}")
    @Transactional
    public void onChatNotification(ChatNotificationEvent event) {
        if (event == null || event.getRecipientIds() == null || event.getConversationId() == null
                || !"NEW_MESSAGE".equals(event.getType())) {
            log.warn("Événement de messagerie invalide ignoré");
            return;
        }

        String preview = event.getMessagePreview() == null ? "" : event.getMessagePreview().trim();
        if (preview.length() > 350) preview = preview.substring(0, 347) + "...";
        String message = ((event.getSenderName() == null || event.getSenderName().isBlank())
                ? "Nouveau message" : event.getSenderName()) + (preview.isBlank() ? "" : ": " + preview);

        for (Long recipientId : event.getRecipientIds().stream().filter(java.util.Objects::nonNull).distinct().toList()) {
            NotificationHistory history = new NotificationHistory();
            history.setTypeAlerte(TypeAlerte.NOUVEAU_MESSAGE);
            history.setCanal(CanalNotification.IN_APP);
            history.setStatut(StatutNotification.ENVOYE);
            history.setMessage(message);
            history.setConversationId(event.getConversationId());
            if ("PATIENT".equalsIgnoreCase(event.getRecipientType())) {
                history.setPatientId(recipientId);
            } else if ("MEDECIN".equalsIgnoreCase(event.getRecipientType())) {
                history.setMedecinId(recipientId);
            } else {
                log.warn("Type destinataire de notification invalide: {}", event.getRecipientType());
                return;
            }
            historyRepository.save(history);
        }
    }
}
