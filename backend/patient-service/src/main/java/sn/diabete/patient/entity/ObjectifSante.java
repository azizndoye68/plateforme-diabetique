package sn.diabete.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "objectifs_sante")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObjectifSante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String libelle;

    private String valeurCible;

    private LocalDate dateCreation = LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @PrePersist
    public void prePersist() {
        if (dateCreation == null) {
            dateCreation = LocalDate.now();
        }
    }
}
