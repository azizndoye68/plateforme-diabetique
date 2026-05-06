package sn.diabete.suivimedical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "journal_bord")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JournalBord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId; // Référence vers le patient concerné

    private String repas;               // Description du repas

    private String activitePhysique;    // Activité physique (légère, modérée, etc.)

    private String symptomes;           // Symptômes (hypoglycémie, vertige, etc.)

    private String evenements;          // Événement de santé (stress, maladie, etc.)

    private LocalDateTime dateSuivi;     // Date et heure d’enregistrement

    @PrePersist
    protected void onCreate() {
        this.dateSuivi = LocalDateTime.now();
    }
}
