package sn.diabete.patient.dto;

import lombok.Data;
import sn.diabete.patient.entity.Sexe;
import sn.diabete.patient.entity.TypeDiabete;

import java.time.LocalDate;

@Data
public class PatientResponse {
    private Long id;
    private Long utilisateurId;

    // 🔹 ID du médecin référent
    private Long medecinId;

    private String numeroDossier;
    private String prenom;
    private String nom;
    private String telephone;
    private LocalDate dateNaissance;
    private Sexe sexe;
    private TypeDiabete typeDiabete;
    //private String traitement;
    private String adresse;
    private String ville;
    private String region;
    private LocalDate dateEnregistrement;


}
