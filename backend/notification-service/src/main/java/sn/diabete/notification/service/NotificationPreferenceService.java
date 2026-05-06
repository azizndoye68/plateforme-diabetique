package sn.diabete.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.notification.dto.NotificationPreferenceRequest;
import sn.diabete.notification.dto.NotificationPreferenceResponse;
import sn.diabete.notification.entity.NotificationPreference;
import sn.diabete.notification.repository.NotificationPreferenceRepository;

import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    public NotificationPreferenceResponse createOrUpdatePreference(NotificationPreferenceRequest request) {
        NotificationPreference preference = preferenceRepository
                .findByPatientId(request.getPatientId())
                .orElse(new NotificationPreference());

        preference.setPatientId(request.getPatientId());
        preference.setMedecinId(request.getMedecinId());

        // 🆕 Utilisation de parseTime pour accepter "HH:mm" et "HH:mm:ss"
        preference.setRappelMatin(
                request.getRappelMatin() != null && !request.getRappelMatin().isEmpty()
                        ? parseTime(request.getRappelMatin()) : null
        );
        preference.setRappelMidi(
                request.getRappelMidi() != null && !request.getRappelMidi().isEmpty()
                        ? parseTime(request.getRappelMidi()) : null
        );
        preference.setRappelSoir(
                request.getRappelSoir() != null && !request.getRappelSoir().isEmpty()
                        ? parseTime(request.getRappelSoir()) : null
        );

        preference.setAlerteEmailActif(request.getAlerteEmailActif());
        preference.setAlerteSmsActif(request.getAlerteSmsActif());
        preference.setAlertePushActif(request.getAlertePushActif());
        preference.setSeuilHypoPersonnalise(request.getSeuilHypoPersonnalise());
        preference.setSeuilHyperPersonnalise(request.getSeuilHyperPersonnalise());

        NotificationPreference saved = preferenceRepository.save(preference);
        return mapToResponse(saved);
    }

    public NotificationPreferenceResponse getPreferenceByPatientId(Long patientId) {
        NotificationPreference preference = preferenceRepository
                .findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException(
                        "Préférences non trouvées pour le patient : " + patientId
                ));
        return mapToResponse(preference);
    }

    public void deletePreference(Long patientId) {
        NotificationPreference preference = preferenceRepository
                .findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException(
                        "Préférences non trouvées pour le patient : " + patientId
                ));
        preferenceRepository.delete(preference);
    }

    // 🆕 Accepte "HH:mm" (envoyé par le frontend) et "HH:mm:ss"
    private LocalTime parseTime(String time) {
        if (time == null || time.isEmpty()) return null;
        // Format court "HH:mm" → on complète avec ":00"
        if (time.length() == 5) {
            return LocalTime.parse(time + ":00");
        }
        return LocalTime.parse(time);
    }

    private NotificationPreferenceResponse mapToResponse(NotificationPreference pref) {
        NotificationPreferenceResponse response = new NotificationPreferenceResponse();
        response.setId(pref.getId());
        response.setPatientId(pref.getPatientId());
        response.setMedecinId(pref.getMedecinId());
        response.setRappelMatin(pref.getRappelMatin());
        response.setRappelMidi(pref.getRappelMidi());
        response.setRappelSoir(pref.getRappelSoir());
        response.setAlerteEmailActif(pref.getAlerteEmailActif());
        response.setAlerteSmsActif(pref.getAlerteSmsActif());
        response.setAlertePushActif(pref.getAlertePushActif());
        response.setSeuilHypoPersonnalise(pref.getSeuilHypoPersonnalise());
        response.setSeuilHyperPersonnalise(pref.getSeuilHyperPersonnalise());
        return response;
    }
}