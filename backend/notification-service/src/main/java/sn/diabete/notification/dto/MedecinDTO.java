package sn.diabete.notification.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MedecinDTO {

    private Long id;
    private Long utilisateurId;
    private String prenom;
    private String nom;
    private String telephone;
    private LocalDate dateNaissance;
    private String sexe;
    private String specialite;
    private String nomService;
    private String adresse;
    private String ville;
    private String region;
}
