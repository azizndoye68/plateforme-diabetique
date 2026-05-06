package sn.diabete.suivimedical.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import sn.diabete.suivimedical.analysis.GlycemieAnalysisService;
import sn.diabete.suivimedical.event.GlycemieEvent;

import java.time.LocalDateTime;

/**
 * Service responsable de publier les événements de glycémie vers RabbitMQ
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GlycemieEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.glycemie}")
    private String glycemieExchange;

    @Value("${rabbitmq.routing-key.notification}")
    private String notificationRoutingKey;

    /**
     * Publie un événement de glycémie anormale
     */
    public void publishGlycemieEvent(GlycemieAnalysisService.AnalysisResult analysisResult) {
        try {
            GlycemieEvent event = buildEvent(analysisResult);

            rabbitTemplate.convertAndSend(
                    glycemieExchange,
                    notificationRoutingKey,
                    event
            );

            log.info("✅ Événement glycémie publié : Patient {} - Type {}",
                    event.getPatientId(),
                    event.getTypeAlerte());

        } catch (Exception e) {
            log.error("❌ Erreur lors de la publication de l'événement : {}", e.getMessage(), e);
        }
    }

    /**
     * Construit l'événement à partir du résultat d'analyse
     */
    private GlycemieEvent buildEvent(GlycemieAnalysisService.AnalysisResult result) {
        GlycemieEvent event = new GlycemieEvent();

        event.setGlycemieId(result.getGlycemie().getId());
        event.setPatientId(result.getGlycemie().getPatientId());
        event.setValeurGlycemie(result.getGlycemie().getGlycemie());
        event.setMoment(result.getGlycemie().getMoment());
        event.setRepas(result.getGlycemie().getRepas());
        event.setDateEnregistrement(result.getGlycemie().getDateSuivi());

        event.setNiveauAlerte(result.getNiveauAlerte());
        event.setTypeAlerte(result.getTypeAlerte());
        event.setMessage(result.getMessage());
        event.setRecommandation(result.getRecommandation());
        event.setAlerterMedecin(result.getAlerterMedecin());

        event.setEventTimestamp(LocalDateTime.now());

        return event;
    }
}
