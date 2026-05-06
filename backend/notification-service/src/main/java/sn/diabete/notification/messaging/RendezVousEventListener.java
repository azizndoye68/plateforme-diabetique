package sn.diabete.notification.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import sn.diabete.notification.event.RendezVousEvent;
import sn.diabete.notification.service.RendezVousAlertService;

@Component
@RequiredArgsConstructor
@Slf4j
public class RendezVousEventListener {

    private final RendezVousAlertService rendezVousAlertService;

    @RabbitListener(queues = "${rabbitmq.queue.rendezvous-notification}")
    public void handleRendezVousEvent(RendezVousEvent event) {
        log.info("📅 Événement RDV reçu : {} pour patient {}",
                event.getTypeEvenement(), event.getPatientId());

        try {
            rendezVousAlertService.handleRendezVousEvent(event);
            log.info("✅ Événement RDV traité avec succès");
        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement de l'événement RDV : {}",
                    e.getMessage(), e);
        }
    }
}