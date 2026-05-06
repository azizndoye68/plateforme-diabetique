package sn.diabete.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "conseils_personnalises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConseilPersonnalise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeConseil typeConseil;  // TEXTE, VIDEO, PDF

    private String lienVideo;         // URL YouTube, Vimeo, etc.

    private String cheminFichierPdf;  // Chemin local ou URL S3/MinIO

    private String nomFichierPdf;     // Nom original du fichier PDF

    private LocalDate dateCreation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @PrePersist
    public void prePersist() {
        if (dateCreation == null) {
            dateCreation = LocalDate.now();
        }
    }
}