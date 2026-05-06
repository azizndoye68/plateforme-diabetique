package sn.diabete.medecin.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import sn.diabete.medecin.entity.RendezVous;
import sn.diabete.medecin.entity.StatutRendezVous;
import sn.diabete.medecin.event.RendezVousEvent;
import sn.diabete.medecin.messaging.RendezVousEventPublisher;
import sn.diabete.medecin.repository.RendezVousRepository;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RendezVousRappelScheduler {

    private final RendezVousRepository rendezVousRepository;
    private final RendezVousEventPublisher eventPublisher;

    private static final List<StatutRendezVous> STATUTS_ACTIFS =
            List.of(StatutRendezVous.PLANIFIE, StatutRendezVous.CONFIRME);

    /**
     * Rappel J-1 : tous les jours à 8h00
     */
    @Scheduled(cron = "${scheduler.rendezvous.rappel-j1.cron:0 0 8 * * *}")
    public void sendRappelJMoinsUn() {
        log.info("📅 Démarrage des rappels J-1 pour les rendez-vous de demain");

        LocalDateTime debutDemain = LocalDateTime.now().plusDays(1).toLocalDate().atStartOfDay();
        LocalDateTime finDemain = debutDemain.plusDays(1).minusSeconds(1);

        List<RendezVous> rdvsDemain = rendezVousRepository
                .findRendezVousDemain(debutDemain, finDemain, STATUTS_ACTIFS);

        log.info("📋 {} rendez-vous à rappeler pour demain", rdvsDemain.size());

        for (RendezVous rdv : rdvsDemain) {
            try {
                eventPublisher.publishEvent(
                        RendezVousEvent.builder()
                                .rendezVousId(rdv.getId())
                                .patientId(rdv.getPatientId())
                                .medecinId(rdv.getMedecin().getId())
                                .medecinUtilisateurId(rdv.getMedecin().getUtilisateurId()) // 🆕
                                .medecinNom(rdv.getMedecin().getNom())
                                .medecinPrenom(rdv.getMedecin().getPrenom())
                                .dateRdv(rdv.getDateRdv())
                                .motif(rdv.getMotif())
                                .statut(rdv.getStatut())
                                .typeEvenement("RAPPEL_J1")
                                .build()
                );
            } catch (Exception e) {
                log.error("❌ Erreur rappel J-1 pour RDV {} : {}", rdv.getId(), e.getMessage());
            }
        }

        log.info("✅ Rappels J-1 terminés");
    }

    /**
     * Rappel H-2 : toutes les heures, vérifie les RDV dans 2h (±5 min)
     */
    @Scheduled(cron = "${scheduler.rendezvous.rappel-h2.cron:0 0 * * * *}")
    public void sendRappelHMoinsDeux() {
        log.info("⏰ Démarrage des rappels H-2 pour les rendez-vous imminents");

        LocalDateTime debut = LocalDateTime.now().plusHours(2).minusMinutes(5);
        LocalDateTime fin   = LocalDateTime.now().plusHours(2).plusMinutes(5);

        List<RendezVous> rdvsImminents = rendezVousRepository
                .findRendezVousDansDeuxHeures(debut, fin, STATUTS_ACTIFS);

        log.info("📋 {} rendez-vous imminents à rappeler", rdvsImminents.size());

        for (RendezVous rdv : rdvsImminents) {
            try {
                eventPublisher.publishEvent(
                        RendezVousEvent.builder()
                                .rendezVousId(rdv.getId())
                                .patientId(rdv.getPatientId())
                                .medecinId(rdv.getMedecin().getId())
                                .medecinUtilisateurId(rdv.getMedecin().getUtilisateurId()) // 🆕
                                .medecinNom(rdv.getMedecin().getNom())
                                .medecinPrenom(rdv.getMedecin().getPrenom())
                                .dateRdv(rdv.getDateRdv())
                                .motif(rdv.getMotif())
                                .statut(rdv.getStatut())
                                .typeEvenement("RAPPEL_H2")
                                .build()
                );
            } catch (Exception e) {
                log.error("❌ Erreur rappel H-2 pour RDV {} : {}", rdv.getId(), e.getMessage());
            }
        }

        log.info("✅ Rappels H-2 terminés");
    }
}