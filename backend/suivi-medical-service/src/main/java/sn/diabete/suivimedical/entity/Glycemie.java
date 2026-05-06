package sn.diabete.suivimedical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.diabete.suivimedical.enums.NiveauAlerte;
import sn.diabete.suivimedical.enums.TypeAlerte;

import java.time.LocalDateTime;

@Entity
@Table(name = "glycemies")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Glycemie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;

    private Double glycemie;

    private String moment;

    private String repas;

    private LocalDateTime dateSuivi;

    // 🆕 Nouveaux champs pour l'analyse et les alertes
    @Enumerated(EnumType.STRING)
    private NiveauAlerte niveauAlerte;

    @Enumerated(EnumType.STRING)
    private TypeAlerte typeAlerte;

    private Boolean evenementEnvoye = false;  // Indique si l'événement a été publié

    @PrePersist
    protected void onCreate() {
        this.dateSuivi = LocalDateTime.now();
    }
}
