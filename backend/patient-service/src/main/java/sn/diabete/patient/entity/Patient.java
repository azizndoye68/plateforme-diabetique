package sn.diabete.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id", nullable = false, unique = true)
    private Long utilisateurId;

    // 🔹 ID du médecin référent
    private Long medecinId;

    @Column(nullable = false, unique = true, updatable = false)
    private String numeroDossier;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String telephone;

    @Column(nullable = false)
    private LocalDate dateNaissance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sexe sexe;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeDiabete typeDiabete;

    private String adresse;

    private String ville;

    private String region;

    private LocalDate dateEnregistrement = LocalDate.now();

    // 🔹 Relations
    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private DossierMedical dossierMedical;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ObjectifSante> objectifs = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "patient_contenu_educatif",
            joinColumns = @JoinColumn(name = "patient_id"),
            inverseJoinColumns = @JoinColumn(name = "contenu_educatif_id")
    )
    private Set<ContenuEducatif> contenusConsultes = new HashSet<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ConseilPersonnalise> conseils = new HashSet<>();

    @PrePersist
    public void prePersist() {
        if (dateEnregistrement == null) {
            dateEnregistrement = LocalDate.now();
        }
    }
}
