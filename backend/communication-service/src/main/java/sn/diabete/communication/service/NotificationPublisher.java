package sn.diabete.communication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import sn.diabete.communication.config.RabbitMQConfig;
import sn.diabete.communication.dto.NotificationMessageDTO;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Publier notification vers RabbitMQ
     */
    public void publishNotification(NotificationMessageDTO notification) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.NOTIFICATION_EXCHANGE,
                    RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                    notification
            );
            log.info("Notification publiée pour {} destinataires",
                    notification.getRecipientIds().size());
        } catch (Exception e) {
            log.error("Erreur publication notification", e);
        }
    }
}