package sn.diabete.medecin.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import sn.diabete.medecin.event.RendezVousEvent;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class RendezVousEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.rendezvous}")
    private String rendezvousExchange;

    @Value("${rabbitmq.routing-key.rendezvous-notification}")
    private String routingKey;

    public void publishEvent(RendezVousEvent event) {
        try {
            event.setEventTimestamp(LocalDateTime.now());
            rabbitTemplate.convertAndSend(rendezvousExchange, routingKey, event);
            log.info("✅ Événement RDV publié : {} pour patient {}",
                    event.getTypeEvenement(), event.getPatientId());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la publication de l'événement RDV : {}",
                    e.getMessage(), e);
        }
    }
}