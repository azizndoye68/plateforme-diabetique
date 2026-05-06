package sn.diabete.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "contenus_educatifs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContenuEducatif {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    private String type; // ARTICLE, VIDEO, PDF

    private String url;

    private LocalDate datePublication = LocalDate.now();

    @ManyToMany(mappedBy = "contenusConsultes")
    private Set<Patient> patients = new HashSet<>();

    @PrePersist
    public void prePersist() {
        if (datePublication == null) {
            datePublication = LocalDate.now();
        }
    }
}
