package sn.diabete.notification.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import sn.diabete.notification.client.GlycemieClient;
import sn.diabete.notification.client.PatientClient;
import sn.diabete.notification.config.GlycemieConfig;
import sn.diabete.notification.dto.PatientDTO;
import sn.diabete.notification.service.AlertService;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class InactivityCheckScheduler {

    private final PatientClient patientClient;
    private final GlycemieClient glycemieClient;
    private final AlertService alertService;
    private final GlycemieConfig glycemieConfig;

    /**
     * Vérifie quotidiennement les patients inactifs
     * S'exécute tous les jours à 1h du matin
     */
    @Scheduled(cron = "${scheduler.inactivite.cron}")
    public void checkInactivePatients() {
        log.info("🔍 Démarrage de la vérification des patients inactifs");

        Integer joursAlerte = glycemieConfig.getInactivite().getJoursAlerte();
        LocalDateTime dateLimit = LocalDateTime.now().minusDays(joursAlerte);

        List<PatientDTO> allPatients = patientClient.getAllPatients();

        log.info("Nombre total de patients à vérifier: {}", allPatients.size());

        int patientsInactifs = 0;

        for (PatientDTO patient : allPatients) {
            try {
                // Récupérer la date de la dernière mesure
                LocalDateTime dateDerniereMesure = glycemieClient.getLastMeasurementDate(patient.getId());

                if (dateDerniereMesure == null) {
                    log.warn("Patient {} n'a aucune mesure enregistrée", patient.getId());
                    continue;
                }

                // Vérifier si la dernière mesure est trop ancienne
                if (dateDerniereMesure.isBefore(dateLimit)) {
                    long joursInactivite = ChronoUnit.DAYS.between(dateDerniereMesure, LocalDateTime.now());

                    log.warn("Patient {} inactif depuis {} jours", patient.getId(), joursInactivite);

                    alertService.sendInactivityAlert(patient.getId(), (int) joursInactivite);
                    patientsInactifs++;
                }

            } catch (Exception e) {
                log.error("Erreur lors de la vérification du patient {}: {}", patient.getId(), e.getMessage());
            }
        }

        log.info("✅ Vérification terminée - {} patients inactifs détectés", patientsInactifs);
    }
}