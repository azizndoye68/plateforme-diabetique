package sn.diabete.suivimedical.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientDTO {
    private Long id;
    private String prenom;
    private String nom;
    private String telephone;
    private LocalDate dateNaissance;
    private String sexe;
    private String typeDiabete;
    private String traitement;
    private String adresse;
    private String ville;
    private String region;
}

