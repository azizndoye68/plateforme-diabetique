package sn.diabete.medecin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "medecins")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id")
    private Long utilisateurId;

    @Column(nullable = false, unique = true, updatable = false)
    private String numeroProfessionnel;

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

    private String specialite;
    private String nomService;
    private String adresse;
    private String ville;
    private String region;

    private LocalDate dateEnregistrement = LocalDate.now();

    /* ============================================================
       RENDEZ-VOUS
       ============================================================ */

    // 1 médecin peut planifier plusieurs rendez-vous
    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RendezVous> rendezVousList;

    /* ============================================================
       ÉQUIPES MÉDICALES
       ============================================================ */

    // Équipes créées par le médecin (propriétaire)
    @OneToMany(mappedBy = "medecinProprietaire")
    private List<EquipeMedicale> equipesCreees;

    // Équipes auxquelles le médecin appartient
    @ManyToMany(mappedBy = "medecins")
    private List<EquipeMedicale> equipes;

    /* ============================================================
       LIFECYCLE
       ============================================================ */

    @PrePersist
    public void prePersist() {
        if (dateEnregistrement == null) {
            dateEnregistrement = LocalDate.now();
        }
    }
}
