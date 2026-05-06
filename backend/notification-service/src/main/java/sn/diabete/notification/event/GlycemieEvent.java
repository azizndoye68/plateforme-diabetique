package sn.diabete.notification.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.diabete.notification.enums.NiveauAlerte;
import sn.diabete.notification.enums.TypeAlerte;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Événement reçu depuis suivi-medical-service via RabbitMQ
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GlycemieEvent implements Serializable {

    private Long glycemieId;
    private Long patientId;
    private Long utilisateurId;
    private Double valeurGlycemie;
    private String moment;
    private String repas;
    private LocalDateTime dateEnregistrement;

    // Résultats de l'analyse
    private NiveauAlerte niveauAlerte;
    private TypeAlerte typeAlerte;
    private String message;
    private String recommandation;
    private Boolean alerterMedecin;

    // Métadonnées
    private LocalDateTime eventTimestamp;
    private String eventType = "GLYCEMIE_ALERTE";
}