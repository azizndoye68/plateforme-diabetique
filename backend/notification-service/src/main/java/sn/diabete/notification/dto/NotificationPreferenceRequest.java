package sn.diabete.notification.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalTime;

/**
 * DTO pour la création/modification des préférences de notification
 */
@Data
public class NotificationPreferenceRequest {
    private Long patientId;
    private Long medecinId;

    @Schema(example = "08:00:00")
    private String rappelMatin;

    @Schema(example = "13:00:00")
    private String rappelMidi;

    @Schema(example = "20:00:00")
    private String rappelSoir;


    private Boolean alerteEmailActif;
    private Boolean alerteSmsActif;
    private Boolean alertePushActif;
    private Double seuilHypoPersonnalise;
    private Double seuilHyperPersonnalise;

    // ⚠️ Les champs 'email' et 'telephone' ont été supprimés
    // car ils sont gérés par auth-service et patient-service
}