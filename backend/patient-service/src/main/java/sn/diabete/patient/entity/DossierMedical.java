package sn.diabete.patient.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dossiers_medicaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DossierMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String traitement;

    private String antecedents;

    private String allergies;

    @Column(length = 2000)
    private String notesMedicales;

    @OneToOne
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private Patient patient;
}
