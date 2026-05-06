package sn.diabete.notification.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import sn.diabete.notification.event.GlycemieEvent;
import sn.diabete.notification.service.AlertService;

/**
 * Écoute les événements de glycémie depuis RabbitMQ
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GlycemieEventListener {

    private final AlertService alertService;

    /**
     * Écoute la queue notification.queue
     */
    @RabbitListener(queues = "${rabbitmq.queue.notification}")
    public void handleGlycemieEvent(GlycemieEvent event) {
        log.info("🔔 Événement reçu : Patient {} - Type {}",
                event.getPatientId(),
                event.getTypeAlerte());

        try {
            alertService.handleGlycemieEvent(event);
            log.info("✅ Événement traité avec succès");

        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement de l'événement : {}", e.getMessage(), e);
            // TODO: Implémenter une DLQ (Dead Letter Queue) pour les échecs
        }
    }
}