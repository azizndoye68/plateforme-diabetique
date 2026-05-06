package sn.diabete.suivimedical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "donnees_physiques")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DonneePhysique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId; // Référence vers le patient concerné

    private Double poids;           // Poids en Kg

    private String tension;         // Tension artérielle (ex: 12/8)

    private LocalDateTime dateSuivi; // Date et heure d’enregistrement

    @PrePersist
    protected void onCreate() {
        this.dateSuivi = LocalDateTime.now();
    }
}
