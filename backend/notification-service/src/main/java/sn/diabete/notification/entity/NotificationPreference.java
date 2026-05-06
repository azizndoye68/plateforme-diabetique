package sn.diabete.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

/**
 * Entité représentant les préférences de notification d'un patient
 *
 * Note: Les emails et téléphones ne sont PAS stockés ici car ils sont
 * récupérés depuis auth-service et patient-service respectivement
 */
@Entity
@Table(name = "notification_preferences")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long patientId;  // Référence vers patient-service

    private Long medecinId;  // Référence vers medecin-service

    // ====================================
    // Horaires de rappel
    // ====================================
    private LocalTime rappelMatin;
    private LocalTime rappelMidi;
    private LocalTime rappelSoir;

    // ====================================
    // Canaux de notification activés
    // ====================================
    private Boolean alerteEmailActif = true;   // Email activé par défaut
    private Boolean alerteSmsActif = false;    // SMS désactivé par défaut
    private Boolean alertePushActif = false;   // Push désactivé par défaut

    // ====================================
    // Seuils personnalisés (optionnel)
    // ====================================
    private Double seuilHypoPersonnalise;      // Seuil personnalisé pour hypoglycémie
    private Double seuilHyperPersonnalise;     // Seuil personnalisé pour hyperglycémie

    // ⚠️ NOTE IMPORTANTE:
    // Les champs 'email' et 'telephone' ont été SUPPRIMÉS car :
    // - L'email est récupéré depuis auth-service via authClient.getUserEmail(utilisateurId)
    // - Le téléphone est récupéré depuis patient-service via patientClient.getPatientById(patientId)
    //
    // Cela évite la duplication de données et garantit que les informations
    // sont toujours à jour depuis leur source unique de vérité.
}