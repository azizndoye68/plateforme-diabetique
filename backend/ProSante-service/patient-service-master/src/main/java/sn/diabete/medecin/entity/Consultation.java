package sn.diabete.medecin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 Patient (géré par patient-service)
    @Column(nullable = false)
    private Long patientId;

    // 🔹 Date et heure de la consultation
    @Column(nullable = false)
    private LocalDateTime dateConsultation;

    // 🔹 Motif
    private String motif;

    // 🔹 Diagnostic médical
    @Column(length = 1000)
    private String diagnostic;

    // 🔹 Prescription / recommandations
    @Column(length = 1000)
    private String prescription;

    // 🔹 Médecin consultant
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    @PrePersist
    protected void onCreate() {
        this.dateConsultation = LocalDateTime.now();
    }
}
