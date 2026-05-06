package sn.diabete.medecin.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import sn.diabete.medecin.entity.Sexe;

import java.time.LocalDate;

@Data
public class MedecinRequest {

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

    @Size(max = 100, message = "La spécialité ne doit pas dépasser 100 caractères")
    private String specialite;

    @Size(max = 100, message = "Le nom du service ne doit pas dépasser 100 caractères")
    private String nomService;

    @Size(max = 255, message = "L'adresse est trop longue")
    private String adresse;

    @Size(max = 100, message = "La ville ne doit pas dépasser 100 caractères")
    private String ville;

    @Size(max = 100, message = "La région ne doit pas dépasser 100 caractères")
    private String region;
}
