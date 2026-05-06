package sn.diabete.patient.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import sn.diabete.patient.entity.Sexe;
import sn.diabete.patient.entity.TypeDiabete;

import java.time.LocalDate;

@Data
public class PatientRequest {

    @NotNull(message = "L'identifiant utilisateur est obligatoire")
    private Long utilisateurId;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
    private String nom;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(
            regexp = "^[0-9]{9,15}$",
            message = "Le numéro de téléphone est invalide"
    )
    private String telephone;

    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    private LocalDate dateNaissance;

    @NotNull(message = "Le sexe est obligatoire")
    private Sexe sexe;

    @NotNull(message = "Le type de diabète est obligatoire")
    private TypeDiabete typeDiabete;

    @Size(max = 255, message = "L'adresse est trop longue")
    private String adresse;

    @Size(max = 100, message = "La ville ne doit pas dépasser 100 caractères")
    private String ville;

    @Size(max = 100, message = "La région ne doit pas dépasser 100 caractères")
    private String region;

    // 🔹 Liaison médecin (optionnelle à l’inscription)
    @Size(
            min = 3,
            max = 50,
            message = "Le numéro professionnel du médecin est invalide"
    )
    private String numeroProfessionnelMedecin;

    // Rempli automatiquement → pas de validation
    private Long medecinId;
}
