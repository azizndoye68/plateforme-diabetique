package sn.diabete.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "utilisateurs")
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutCompte statut; // PENDING, APPROVED, REJECTED

    @Column(nullable = false)
    private boolean enabled = false; // false par défaut, activé selon rôle

    //@Column(nullable = false)
    //private boolean emailVerifie = false; // après clic sur lien de vérification

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    // Constructeur pratique pour initialiser automatiquement les bons statuts
    public Utilisateur(String username, String email, String password, Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;

        if (role.getNom() == TypeRole.PATIENT || role.getNom() == TypeRole.ADMIN) {
            this.enabled = true;
            this.statut = StatutCompte.APPROVED;
        } else {
            // Médecin ou infirmier : nécessite validation par admin
            this.enabled = false;
            this.statut = StatutCompte.PENDING;
        }
    }
}
