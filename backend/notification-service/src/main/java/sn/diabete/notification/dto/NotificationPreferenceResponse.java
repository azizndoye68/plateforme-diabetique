package sn.diabete.notification.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

/**
 * DTO pour la réponse contenant les préférences de notification
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationPreferenceResponse {
    private Long id;
    private Long patientId;
    private Long medecinId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime rappelMatin;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime rappelMidi;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime rappelSoir;

    private Boolean alerteEmailActif;
    private Boolean alerteSmsActif;
    private Boolean alertePushActif;
    private Double seuilHypoPersonnalise;
    private Double seuilHyperPersonnalise;

    // ⚠️ Les champs 'email' et 'telephone' ont été supprimés
}
