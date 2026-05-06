package sn.diabete.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sn.diabete.notification.client.AuthClient;
import sn.diabete.notification.client.MedecinClient;
import sn.diabete.notification.client.PatientClient;
import sn.diabete.notification.dto.MedecinDTO;
import sn.diabete.notification.dto.PatientDTO;
import sn.diabete.notification.entity.NotificationPreference;
import sn.diabete.notification.enums.TypeAlerte;
import sn.diabete.notification.event.GlycemieEvent;
import sn.diabete.notification.repository.NotificationPreferenceRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final NotificationService notificationService;
    private final NotificationPreferenceRepository preferenceRepository;
    private final PatientClient patientClient;
    private final MedecinClient medecinClient;
    private final AuthClient authClient;

    // ======================================================
    // POINT D'ENTRÉE PRINCIPAL
    // ======================================================

    public void handleGlycemieEvent(GlycemieEvent event) {
        log.info("📨 Traitement événement glycémie pour patient {}", event.getPatientId());
        try {
            sendPatientAlert(event);
            if (Boolean.TRUE.equals(event.getAlerterMedecin())) {
                sendDoctorAlert(event);
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement de l'événement : {}", e.getMessage(), e);
        }
    }

    // ======================================================
    // ALERTE PATIENT
    // ======================================================

    private void sendPatientAlert(GlycemieEvent event) {
        Long patientId = event.getPatientId();
        try {
            NotificationPreference preferences = preferenceRepository
                    .findByPatientId(patientId)
                    .orElseGet(() -> createDefaultPreferences(patientId));

            PatientDTO patient = patientClient.getPatientById(patientId);

            String emailPatient = null;
            try {
                emailPatient = authClient.getUserEmail(patient.getUtilisateurId());
                log.info("📧 Email patient récupéré : {}", emailPatient);
            } catch (Exception e) {
                log.error("❌ Impossible de récupérer l'email du patient {} : {}",
                        patientId, e.getMessage());
                return;
            }

            if (Boolean.TRUE.equals(preferences.getAlerteEmailActif()) && emailPatient != null) {
                notificationService.sendEmail(
                        emailPatient,
                        "⚠️ Alerte Glycémie — " + event.getTypeAlerte().getLibelle(),
                        buildPatientMessage(patient, event),
                        patientId,
                        null,
                        event.getTypeAlerte(),
                        event.getGlycemieId()
                );
                log.info("✅ Email envoyé au patient {} ({})", patientId, emailPatient);
            }

            if (Boolean.TRUE.equals(preferences.getAlerteSmsActif()) && patient.getTelephone() != null) {
                notificationService.sendSms(
                        patient.getTelephone(),
                        buildShortMessage(event),
                        patientId,
                        null,
                        event.getTypeAlerte(),
                        event.getGlycemieId()
                );
                log.info("✅ SMS envoyé au patient {} ({})", patientId, patient.getTelephone());
            }

            log.info("✅ Alerte patient {} traitée avec succès", patientId);

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'alerte patient {}: {}",
                    patientId, e.getMessage(), e);
        }
    }

    // ======================================================
    // ALERTE MÉDECIN — GLYCÉMIE
    // ======================================================

    private void sendDoctorAlert(GlycemieEvent event) {
        Long patientId = event.getPatientId();
        try {
            PatientDTO patient = patientClient.getPatientById(patientId);
            Long medecinId = patient.getMedecinId();

            if (medecinId == null) {
                log.warn("⚠️ Pas de médecin assigné au patient {}", patientId);
                return;
            }

            log.info("👨‍⚕️ Médecin référent du patient {} : ID {}", patientId, medecinId);

            MedecinDTO medecin;
            try {
                medecin = medecinClient.getMedecinById(medecinId);
                log.info("👨‍⚕️ Médecin récupéré : Dr {} {}", medecin.getPrenom(), medecin.getNom());
            } catch (Exception e) {
                log.error("❌ Impossible de récupérer le médecin {} : {}", medecinId, e.getMessage());
                return;
            }

            String emailMedecin;
            try {
                emailMedecin = authClient.getUserEmail(medecin.getUtilisateurId());
                log.info("📧 Email médecin récupéré : {}", emailMedecin);
            } catch (Exception e) {
                log.error("❌ Impossible de récupérer l'email du médecin {} : {}",
                        medecin.getId(), e.getMessage());
                return;
            }

            notificationService.sendEmail(
                    emailMedecin,
                    "🚨 Alerte patient — " + patient.getPrenom() + " " + patient.getNom(),
                    buildDoctorMessage(patient, medecin, event),
                    patientId,
                    medecinId,
                    event.getTypeAlerte(),
                    event.getGlycemieId()
            );

            log.info("✅ Alerte médecin {} envoyée pour patient {} ({})",
                    medecinId, patientId, emailMedecin);

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'alerte médecin : {}", e.getMessage(), e);
        }
    }

    // ======================================================
    // ALERTE INACTIVITÉ — MÉDECIN
    // ======================================================

    public void sendInactivityAlert(Long patientId, int joursInactivite) {
        try {
            PatientDTO patient = patientClient.getPatientById(patientId);
            Long medecinId = patient.getMedecinId();

            if (medecinId == null) {
                log.warn("⚠️ Pas de médecin assigné au patient inactif {}", patientId);
                return;
            }

            MedecinDTO medecin = medecinClient.getMedecinById(medecinId);
            String emailMedecin = authClient.getUserEmail(medecin.getUtilisateurId());

            String message = String.format(
                    "Bonjour Dr %s %s,\n\n" +
                            "Notre système de suivi a détecté une absence prolongée de mesures " +
                            "glycémiques pour l'un de vos patients. Cette situation mérite votre attention.\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "👤 INFORMATIONS PATIENT\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "  • Nom complet      : %s %s\n" +
                            "  • Téléphone        : %s\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "📅 DURÉE D'INACTIVITÉ\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "  • Aucune mesure enregistrée depuis %d jour%s\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "⚕️  ACTION RECOMMANDÉE\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "Nous vous invitons à contacter ce patient afin de vous assurer de son " +
                            "état de santé et de l'encourager à reprendre un suivi régulier de sa glycémie.\n\n" +
                            "Cordialement,\n" +
                            "Le système de surveillance — SUIVIDIABETE SN\n" +
                            "──────────────────────────────\n" +
                            "Cet email est généré automatiquement, merci de ne pas y répondre.",
                    medecin.getPrenom(), medecin.getNom(),
                    patient.getPrenom(), patient.getNom(),
                    patient.getTelephone() != null ? patient.getTelephone() : "Non renseigné",
                    joursInactivite, joursInactivite > 1 ? "s" : ""
            );

            notificationService.sendEmail(
                    emailMedecin,
                    "⚠️ Alerte inactivité — " + patient.getPrenom() + " " + patient.getNom(),
                    message,
                    patientId,
                    medecinId,
                    TypeAlerte.INACTIVITE_PATIENT,
                    null
            );

            log.info("✅ Alerte d'inactivité envoyée pour patient {} ({} jours)",
                    patientId, joursInactivite);

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'alerte d'inactivité pour patient {}: {}",
                    patientId, e.getMessage(), e);
        }
    }

    // ======================================================
    // CONSTRUCTION DES MESSAGES
    // ======================================================

    private NotificationPreference createDefaultPreferences(Long patientId) {
        log.info("Création des préférences par défaut pour patient {}", patientId);
        NotificationPreference pref = new NotificationPreference();
        pref.setPatientId(patientId);
        pref.setAlerteEmailActif(true);
        pref.setAlerteSmsActif(false);
        return preferenceRepository.save(pref);
    }

    private String buildPatientMessage(PatientDTO patient, GlycemieEvent event) {
        return String.format(
                "Bonjour %s,\n\n" +
                        "Nous vous contactons suite à l'enregistrement de votre dernière mesure de " +
                        "glycémie qui nécessite votre attention.\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "📊 RÉSULTAT DE VOTRE MESURE\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "  • Valeur mesurée   : %.2f g/L\n" +
                        "  • Date et heure    : %s\n" +
                        "  • Moment           : %s\n" +
                        "  • Type de repas    : %s\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "⚠️  ÉTAT DÉTECTÉ\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "%s\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "💡 RECOMMANDATION\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "%s\n\n" +
                        "En cas de doute ou si vos symptômes persistent, nous vous invitons à " +
                        "contacter votre médecin référent sans délai.\n\n" +
                        "Prenez soin de vous.\n\n" +
                        "Cordialement,\n" +
                        "L'équipe médicale — SUIVIDIABETE SN\n" +
                        "──────────────────────────────\n" +
                        "Cet email est généré automatiquement, merci de ne pas y répondre.",
                patient.getPrenom(),
                event.getValeurGlycemie(),
                event.getDateEnregistrement(),
                event.getMoment() != null ? event.getMoment() : "Non spécifié",
                event.getRepas() != null ? event.getRepas() : "Non spécifié",
                event.getMessage(),
                event.getRecommandation()
        );
    }

    private String buildDoctorMessage(PatientDTO patient, MedecinDTO medecin, GlycemieEvent event) {
        return String.format(
                "Bonjour Dr %s %s,\n\n" +
                        "Notre système de surveillance a détecté une anomalie glycémique nécessitant " +
                        "votre attention pour l'un de vos patients.\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "👤 INFORMATIONS PATIENT\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "  • Nom complet      : %s %s\n" +
                        "  • Téléphone        : %s\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "🚨 ALERTE DÉTECTÉE : %s\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "  • Valeur mesurée   : %.2f g/L\n" +
                        "  • Date et heure    : %s\n" +
                        "  • Moment           : %s\n" +
                        "  • Type de repas    : %s\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "⚕️  ACTION RECOMMANDÉE\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "Nous vous recommandons de prendre contact avec votre patient dans les plus " +
                        "brefs délais afin d'évaluer son état clinique et d'adapter sa prise en " +
                        "charge si nécessaire.\n\n" +
                        "Cordialement,\n" +
                        "Le système de surveillance — SUIVIDIABETE SN\n" +
                        "──────────────────────────────\n" +
                        "Cet email est généré automatiquement, merci de ne pas y répondre.",
                medecin.getPrenom(), medecin.getNom(),
                patient.getPrenom(), patient.getNom(),
                patient.getTelephone() != null ? patient.getTelephone() : "Non renseigné",
                event.getTypeAlerte().getLibelle(),
                event.getValeurGlycemie(),
                event.getDateEnregistrement(),
                event.getMoment() != null ? event.getMoment() : "Non spécifié",
                event.getRepas() != null ? event.getRepas() : "Non spécifié"
        );
    }

    private String buildShortMessage(GlycemieEvent event) {
        String recommandationCourte = event.getRecommandation()
                .substring(0, Math.min(80, event.getRecommandation().length()));
        return String.format(
                "[SUIVIDIABETE] %s détectée — %.2f g/L. %s",
                event.getTypeAlerte().getLibelle(),
                event.getValeurGlycemie(),
                recommandationCourte
        );
    }
}