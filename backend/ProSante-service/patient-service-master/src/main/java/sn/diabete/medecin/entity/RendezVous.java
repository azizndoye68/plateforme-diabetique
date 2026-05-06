package sn.diabete.medecin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rendez_vous")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 Patient géré par patient-service
    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private LocalDateTime dateRdv;

    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutRendezVous statut;

    // 🔹 Médecin planificateur
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;
}
