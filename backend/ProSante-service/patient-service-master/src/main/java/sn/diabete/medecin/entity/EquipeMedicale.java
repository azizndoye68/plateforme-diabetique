package sn.diabete.medecin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipes_medicales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipeMedicale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    // Médecin propriétaire de l'équipe
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_proprietaire_id", nullable = false)
    private Medecin medecinProprietaire;

    // Médecins membres de l'équipe
    @ManyToMany
    @JoinTable(
            name = "equipe_medecins",
            joinColumns = @JoinColumn(name = "equipe_id"),
            inverseJoinColumns = @JoinColumn(name = "medecin_id")
    )
    private List<Medecin> medecins = new ArrayList<>();
}
