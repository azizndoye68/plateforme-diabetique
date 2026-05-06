package sn.diabete.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sn.diabete.notification.client.AuthClient;
import sn.diabete.notification.client.PatientClient;
import sn.diabete.notification.dto.PatientDTO;
import sn.diabete.notification.entity.NotificationPreference;
import sn.diabete.notification.enums.TypeAlerte;
import sn.diabete.notification.event.RendezVousEvent;
import sn.diabete.notification.repository.NotificationPreferenceRepository;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class RendezVousAlertService {

    private final NotificationService notificationService;
    private final NotificationPreferenceRepository preferenceRepository;
    private final PatientClient patientClient;
    private final AuthClient authClient;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'à' HH'h'mm");

    public void handleRendezVousEvent(RendezVousEvent event) {
        switch (event.getTypeEvenement()) {
            case "PLANIFIE"    -> handlePlanifie(event);
            case "CONFIRME"    -> handleConfirme(event);
            case "ANNULE"      -> handleAnnule(event);
            case "RAPPEL_J1"   -> handleRappel(event, TypeAlerte.RENDEZ_VOUS_RAPPEL_J1);
            case "RAPPEL_H2"   -> handleRappel(event, TypeAlerte.RENDEZ_VOUS_RAPPEL_H2);
            default -> log.warn("⚠️ Type d'événement RDV inconnu : {}", event.getTypeEvenement());
        }
    }

    // ======================================================
    // RDV PLANIFIE → notifier patient + médecin
    // ======================================================
    private void handlePlanifie(RendezVousEvent event) {
        log.info("📅 Traitement notification RDV planifié #{}", event.getRendezVousId());

        PatientDTO patient = fetchPatient(event.getPatientId());
        if (patient == null) return;

        String emailPatient = fetchEmail(patient.getUtilisateurId(), "patient", event.getPatientId());
        NotificationPreference prefs = fetchPrefs(event.getPatientId());

        // --- Notifier le patient ---
        String sujetPatient = "📅 Rendez-vous planifié avec Dr " +
                event.getMedecinPrenom() + " " + event.getMedecinNom();

        String messagePatient = String.format(
                "Bonjour %s,\n\n" +
                        "Un rendez-vous a été planifié pour vous :\n\n" +
                        "👨‍⚕️ Médecin   : Dr %s %s\n" +
                        "📅 Date      : %s\n" +
                        "📋 Motif     : %s\n\n" +
                        "Merci de vous présenter à l'heure prévue.\n\n" +
                        "Cordialement,\n" +
                        "Votre équipe de suivi médical - SUIVIDIABETE SN",
                patient.getPrenom(),
                event.getMedecinPrenom(), event.getMedecinNom(),
                event.getDateRdv().format(FORMATTER),
                event.getMotif() != null ? event.getMotif() : "Non précisé"
        );

        sendToPatient(emailPatient, patient, sujetPatient, messagePatient,
                prefs, event, TypeAlerte.RENDEZ_VOUS_PLANIFIE);

        // --- Notifier le médecin ---
        sendToMedecin(event, patient,
                "📅 Nouveau rendez-vous - " + patient.getPrenom() + " " + patient.getNom(),
                buildMessageMedecinPlanifie(patient, event),
                TypeAlerte.RENDEZ_VOUS_PLANIFIE);
    }

    // ======================================================
    // RDV CONFIRME → notifier patient uniquement
    // ======================================================
    private void handleConfirme(RendezVousEvent event) {
        log.info("✅ Traitement notification RDV confirmé #{}", event.getRendezVousId());

        PatientDTO patient = fetchPatient(event.getPatientId());
        if (patient == null) return;

        String emailPatient = fetchEmail(patient.getUtilisateurId(), "patient", event.getPatientId());
        NotificationPreference prefs = fetchPrefs(event.getPatientId());

        String sujet = "✅ Rendez-vous confirmé avec Dr " +
                event.getMedecinPrenom() + " " + event.getMedecinNom();

        String message = String.format(
                "Bonjour %s,\n\n" +
                        "Votre rendez-vous a été confirmé :\n\n" +
                        "👨‍⚕️ Médecin   : Dr %s %s\n" +
                        "📅 Date      : %s\n" +
                        "📋 Motif     : %s\n\n" +
                        "Merci de vous présenter à l'heure prévue.\n\n" +
                        "Cordialement,\n" +
                        "Votre équipe de suivi médical - SUIVIDIABETE SN",
                patient.getPrenom(),
                event.getMedecinPrenom(), event.getMedecinNom(),
                event.getDateRdv().format(FORMATTER),
                event.getMotif() != null ? event.getMotif() : "Non précisé"
        );

        sendToPatient(emailPatient, patient, sujet, message,
                prefs, event, TypeAlerte.RENDEZ_VOUS_CONFIRME);
    }

    // ======================================================
    // RDV ANNULE → notifier patient + médecin
    // ======================================================
    private void handleAnnule(RendezVousEvent event) {
        log.info("❌ Traitement notification RDV annulé #{}", event.getRendezVousId());

        PatientDTO patient = fetchPatient(event.getPatientId());
        if (patient == null) return;

        String emailPatient = fetchEmail(patient.getUtilisateurId(), "patient", event.getPatientId());
        NotificationPreference prefs = fetchPrefs(event.getPatientId());

        String sujetPatient = "❌ Rendez-vous annulé - Dr " +
                event.getMedecinPrenom() + " " + event.getMedecinNom();

        String messagePatient = String.format(
                "Bonjour %s,\n\n" +
                        "Votre rendez-vous a été annulé :\n\n" +
                        "👨‍⚕️ Médecin   : Dr %s %s\n" +
                        "📅 Date      : %s\n" +
                        "📋 Motif     : %s\n\n" +
                        "Veuillez contacter votre médecin pour reprogrammer.\n\n" +
                        "Cordialement,\n" +
                        "Votre équipe de suivi médical - SUIVIDIABETE SN",
                patient.getPrenom(),
                event.getMedecinPrenom(), event.getMedecinNom(),
                event.getDateRdv().format(FORMATTER),
                event.getMotif() != null ? event.getMotif() : "Non précisé"
        );

        sendToPatient(emailPatient, patient, sujetPatient, messagePatient,
                prefs, event, TypeAlerte.RENDEZ_VOUS_ANNULE);

        sendToMedecin(event, patient,
                "❌ Rendez-vous annulé - " + patient.getPrenom() + " " + patient.getNom(),
                buildMessageMedecinAnnule(patient, event),
                TypeAlerte.RENDEZ_VOUS_ANNULE);
    }

    // ======================================================
    // RAPPEL J-1 et H-2 → notifier patient uniquement
    // ======================================================
    private void handleRappel(RendezVousEvent event, TypeAlerte typeAlerte) {
        log.info("🔔 Traitement rappel RDV {} #{}", typeAlerte, event.getRendezVousId());

        PatientDTO patient = fetchPatient(event.getPatientId());
        if (patient == null) return;

        String emailPatient = fetchEmail(patient.getUtilisateurId(), "patient", event.getPatientId());
        NotificationPreference prefs = fetchPrefs(event.getPatientId());

        boolean estJ1 = typeAlerte == TypeAlerte.RENDEZ_VOUS_RAPPEL_J1;

        String sujet = estJ1
                ? "🔔 Rappel : Rendez-vous demain avec Dr " + event.getMedecinPrenom() + " " + event.getMedecinNom()
                : "⏰ Rappel : Rendez-vous dans 2h avec Dr " + event.getMedecinPrenom() + " " + event.getMedecinNom();

        String message = String.format(
                "Bonjour %s,\n\n" +
                        "%s\n\n" +
                        "👨‍⚕️ Médecin   : Dr %s %s\n" +
                        "📅 Date      : %s\n" +
                        "📋 Motif     : %s\n\n" +
                        "Merci de vous présenter à l'heure prévue.\n\n" +
                        "Cordialement,\n" +
                        "Votre équipe de suivi médical - SUIVIDIABETE SN",
                patient.getPrenom(),
                estJ1
                        ? "Rappel : vous avez un rendez-vous médical demain."
                        : "Rappel : votre rendez-vous médical est dans 2 heures.",
                event.getMedecinPrenom(), event.getMedecinNom(),
                event.getDateRdv().format(FORMATTER),
                event.getMotif() != null ? event.getMotif() : "Non précisé"
        );

        sendToPatient(emailPatient, patient, sujet, message, prefs, event, typeAlerte);
    }

    // ======================================================
    // Méthodes utilitaires
    // ======================================================
    private void sendToPatient(String emailPatient, PatientDTO patient,
                               String sujet, String message,
                               NotificationPreference prefs,
                               RendezVousEvent event, TypeAlerte typeAlerte) {
        if (Boolean.TRUE.equals(prefs.getAlerteEmailActif()) && emailPatient != null) {
            notificationService.sendEmail(
                    emailPatient, sujet, message,
                    event.getPatientId(), null,
                    typeAlerte, null
            );
            log.info("✅ Email RDV envoyé au patient {} ({})",
                    event.getPatientId(), emailPatient);
        }

        if (Boolean.TRUE.equals(prefs.getAlerteSmsActif()) && patient.getTelephone() != null) {
            notificationService.sendSms(
                    patient.getTelephone(),
                    buildSmsPatient(event, typeAlerte),
                    event.getPatientId(), null,
                    typeAlerte, null
            );
            log.info("✅ SMS RDV envoyé au patient {} ({})",
                    event.getPatientId(), patient.getTelephone());
        }
    }

    private void sendToMedecin(RendezVousEvent event, PatientDTO patient,
                               String sujet, String message, TypeAlerte typeAlerte) {
        try {
            if (event.getMedecinId() == null) {
                log.warn("⚠️ medecinId absent dans l'événement RDV #{}", event.getRendezVousId());
                return;
            }

            // 🆕 Récupérer l'email du médecin via son utilisateurId
            if (event.getMedecinUtilisateurId() == null) {
                log.warn("⚠️ medecinUtilisateurId absent dans l'événement RDV #{}", event.getRendezVousId());
                return;
            }

            String emailMedecin = fetchEmail(
                    event.getMedecinUtilisateurId(), "médecin", event.getMedecinId()
            );

            if (emailMedecin == null) {
                log.warn("⚠️ Email médecin introuvable pour RDV #{}", event.getRendezVousId());
                return;
            }

            notificationService.sendEmail(
                    emailMedecin, // 🆕 plus de null
                    sujet,
                    message,
                    event.getPatientId(),
                    event.getMedecinId(),
                    typeAlerte,
                    null
            );

            log.info("✅ Email RDV envoyé au médecin {} ({})",
                    event.getMedecinId(), emailMedecin);

        } catch (Exception e) {
            log.error("❌ Erreur notification médecin pour RDV #{} : {}",
                    event.getRendezVousId(), e.getMessage());
        }
    }
    private PatientDTO fetchPatient(Long patientId) {
        try {
            return patientClient.getPatientById(patientId);
        } catch (Exception e) {
            log.error("❌ Impossible de récupérer le patient {} : {}", patientId, e.getMessage());
            return null;
        }
    }

    private String fetchEmail(Long utilisateurId, String role, Long id) {
        try {
            return authClient.getUserEmail(utilisateurId);
        } catch (Exception e) {
            log.error("❌ Impossible de récupérer l'email du {} {} : {}", role, id, e.getMessage());
            return null;
        }
    }

    private NotificationPreference fetchPrefs(Long patientId) {
        return preferenceRepository.findByPatientId(patientId)
                .orElseGet(() -> {
                    NotificationPreference pref = new NotificationPreference();
                    pref.setPatientId(patientId);
                    pref.setAlerteEmailActif(true);
                    pref.setAlerteSmsActif(false);
                    return preferenceRepository.save(pref);
                });
    }

    private String buildMessageMedecinPlanifie(PatientDTO patient, RendezVousEvent event) {
        return String.format(
                "Bonjour Dr %s %s,\n\n" +
                        "Un rendez-vous a été planifié avec votre patient :\n\n" +
                        "👤 Patient    : %s %s\n" +
                        "📞 Téléphone  : %s\n" +
                        "📅 Date       : %s\n" +
                        "📋 Motif      : %s\n\n" +
                        "Cordialement,\n" +
                        "Système de Suivi Diabète - SUIVIDIABETE SN",
                event.getMedecinPrenom(), event.getMedecinNom(),
                patient.getPrenom(), patient.getNom(),
                patient.getTelephone() != null ? patient.getTelephone() : "Non renseigné",
                event.getDateRdv().format(FORMATTER),
                event.getMotif() != null ? event.getMotif() : "Non précisé"
        );
    }

    private String buildMessageMedecinAnnule(PatientDTO patient, RendezVousEvent event) {
        return String.format(
                "Bonjour Dr %s %s,\n\n" +
                        "Le rendez-vous suivant a été annulé :\n\n" +
                        "👤 Patient    : %s %s\n" +
                        "📞 Téléphone  : %s\n" +
                        "📅 Date       : %s\n" +
                        "📋 Motif      : %s\n\n" +
                        "Cordialement,\n" +
                        "Système de Suivi Diabète - SUIVIDIABETE SN",
                event.getMedecinPrenom(), event.getMedecinNom(),
                patient.getPrenom(), patient.getNom(),
                patient.getTelephone() != null ? patient.getTelephone() : "Non renseigné",
                event.getDateRdv().format(FORMATTER),
                event.getMotif() != null ? event.getMotif() : "Non précisé"
        );
    }

    private String buildSmsPatient(RendezVousEvent event, TypeAlerte typeAlerte) {
        String prefix = switch (typeAlerte) {
            case RENDEZ_VOUS_RAPPEL_J1 -> "Rappel: RDV demain";
            case RENDEZ_VOUS_RAPPEL_H2 -> "Rappel: RDV dans 2h";
            case RENDEZ_VOUS_ANNULE    -> "RDV annulé";
            case RENDEZ_VOUS_CONFIRME  -> "RDV confirmé";
            default                    -> "RDV planifié";
        };
        return String.format("%s avec Dr %s %s le %s. SUIVIDIABETE SN",
                prefix,
                event.getMedecinPrenom(), event.getMedecinNom(),
                event.getDateRdv().format(FORMATTER));
    }
}