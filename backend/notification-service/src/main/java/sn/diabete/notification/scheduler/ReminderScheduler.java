package sn.diabete.notification.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import sn.diabete.notification.client.AuthClient;
import sn.diabete.notification.client.PatientClient;
import sn.diabete.notification.dto.PatientDTO;
import sn.diabete.notification.entity.NotificationPreference;
import sn.diabete.notification.enums.TypeAlerte;
import sn.diabete.notification.repository.NotificationPreferenceRepository;
import sn.diabete.notification.service.NotificationService;

import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final NotificationPreferenceRepository preferenceRepository;
    private final NotificationService notificationService;
    private final PatientClient patientClient;
    private final AuthClient authClient;

    @Scheduled(cron = "${scheduler.rappel.cron}")
    public void checkAndSendReminders() {
        log.info("🔔 Démarrage de la vérification des rappels programmés");

        LocalTime now   = LocalTime.now();
        // Fenêtre de ±1 minute pour le scheduler toutes les minutes
        // 🆕 Fenêtre de 30 secondes
        LocalTime start = now.minusSeconds(30);
        LocalTime end   = now.plusSeconds(30);


        List<NotificationPreference> preferences =
                preferenceRepository.findPatientsWithReminderBetween(start, end);

        log.info("Nombre de patients avec rappels à vérifier : {}", preferences.size());

        for (NotificationPreference pref : preferences) {
            try {
                checkAndSendReminderForMoment(pref, pref.getRappelMatin(), "matin", now);
                checkAndSendReminderForMoment(pref, pref.getRappelMidi(),  "midi",  now);
                checkAndSendReminderForMoment(pref, pref.getRappelSoir(),  "soir",  now);
            } catch (Exception e) {
                log.error("Erreur lors du traitement du rappel pour patient {} : {}",
                        pref.getPatientId(), e.getMessage());
            }
        }

        log.info("✅ Vérification des rappels terminée");
    }

    private void checkAndSendReminderForMoment(NotificationPreference pref,
                                               LocalTime rappelTime,
                                               String moment,
                                               LocalTime now) {
        if (rappelTime == null) return;

        // 🆕 Marge de 30 secondes — évite le double envoi sur 2 exécutions consécutives
        if (Math.abs(rappelTime.toSecondOfDay() - now.toSecondOfDay()) > 30) return;

        sendReminder(pref, moment);
    }
    private void sendReminder(NotificationPreference pref, String moment) {
        try {
            // 1. Récupérer les informations du patient
            PatientDTO patient = patientClient.getPatientById(pref.getPatientId());

            // 2. Récupérer l'email du patient
            String emailPatient = null;
            try {
                emailPatient = authClient.getUserEmail(patient.getUtilisateurId());
            } catch (Exception e) {
                log.error("❌ Impossible de récupérer l'email du patient {} : {}",
                        pref.getPatientId(), e.getMessage());
                return;
            }

            // 3. Message email
            String messageEmail = String.format(
                    "Bonjour %s,\n\n" +
                            "Votre programme de suivi glycémique prévoit une mesure ce %s. " +
                            "Un suivi régulier est essentiel pour votre santé et permet à votre " +
                            "médecin d'adapter votre traitement au mieux.\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "🔔 ACTION REQUISE\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "Veuillez effectuer votre mesure de glycémie et l'enregistrer dans " +
                            "l'application SUIVIDIABETE SN dès que possible.\n\n" +
                            "En cas de valeur anormale, n'hésitez pas à contacter votre médecin " +
                            "référent sans attendre.\n\n" +
                            "Prenez soin de vous.\n\n" +
                            "Cordialement,\n" +
                            "L'équipe médicale — SUIVIDIABETE SN\n" +
                            "──────────────────────────────\n" +
                            "Cet email est généré automatiquement, merci de ne pas y répondre.",
                    patient.getPrenom(),
                    moment
            );

            // 4. Envoyer par email si activé
            if (Boolean.TRUE.equals(pref.getAlerteEmailActif()) && emailPatient != null) {
                notificationService.sendEmail(
                        emailPatient,
                        "🔔 Rappel de mesure de glycémie — " + moment,
                        messageEmail,
                        pref.getPatientId(),
                        null,
                        TypeAlerte.RAPPEL_MESURE,
                        null
                );
                log.info("✅ Email de rappel {} envoyé au patient {} ({})",
                        moment, pref.getPatientId(), emailPatient);
            }

            // 5. Envoyer par SMS si activé
            if (Boolean.TRUE.equals(pref.getAlerteSmsActif()) && patient.getTelephone() != null) {
                String messageSms = String.format(
                        "[SUIVIDIABETE] Rappel %s : pensez à mesurer votre glycémie " +
                                "et à l'enregistrer dans l'application.",
                        moment
                );

                notificationService.sendSms(
                        patient.getTelephone(),
                        messageSms,
                        pref.getPatientId(),
                        null,
                        TypeAlerte.RAPPEL_MESURE,
                        null
                );
                log.info("✅ SMS de rappel {} envoyé au patient {} ({})",
                        moment, pref.getPatientId(), patient.getTelephone());
            }

        } catch (Exception e) {
            log.error("Erreur lors de l'envoi du rappel au patient {} : {}",
                    pref.getPatientId(), e.getMessage(), e);
        }
    }
}