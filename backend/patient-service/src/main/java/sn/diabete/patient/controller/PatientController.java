package sn.diabete.patient.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.patient.dto.PatientRequest;
import sn.diabete.patient.dto.PatientResponse;
import sn.diabete.patient.service.PatientService;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patient", description = "Endpoints pour la gestion des patients")
public class PatientController {

    private final PatientService patientService;

    // ============================
    // 🧍‍♂️ GESTION DES PATIENTS
    // ============================

    @Operation(
            summary = "Créer un patient",
            description = "Permet de créer un patient à partir des informations fournies. "
                    + "Le lien avec un médecin est optionnel lors de l'inscription."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Patient créé avec succès",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides ou patient déjà existant")
    })
    @PostMapping
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody PatientRequest request) {
        PatientResponse response = patientService.createPatient(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Lister tous les patients",
            description = "Retourne la liste complète de tous les patients enregistrés dans le système."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des patients récupérée",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        List<PatientResponse> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @Operation(
            summary = "Récupérer un patient par ID",
            description = "Retourne les informations détaillées d'un patient à partir de son identifiant."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Patient trouvé",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))),
            @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getPatientById(
            @Parameter(description = "Identifiant unique du patient") @PathVariable Long id) {
        PatientResponse patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @Operation(
            summary = "Récupérer un patient par utilisateurId",
            description = "Permet de récupérer un patient à partir de l'identifiant utilisateur "
                    + "provenant du microservice d'authentification."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Patient trouvé",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))),
            @ApiResponse(responseCode = "404", description = "Aucun patient associé à cet utilisateur")
    })
    @GetMapping("/byUtilisateur/{utilisateurId}")
    public ResponseEntity<PatientResponse> getPatientByUtilisateurId(
            @Parameter(description = "Identifiant utilisateur (AuthService)")
            @PathVariable Long utilisateurId) {
        return ResponseEntity.ok(patientService.getPatientByUtilisateurId(utilisateurId));
    }

    @Operation(
            summary = "Mettre à jour un patient",
            description = "Met à jour les informations personnelles d'un patient existant."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Patient mis à jour avec succès",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> updatePatient(
            @Parameter(description = "Identifiant du patient") @PathVariable Long id,
            @Valid @RequestBody PatientRequest request) {
        PatientResponse updatedPatient = patientService.updatePatient(id, request);
        return ResponseEntity.ok(updatedPatient);
    }

    @Operation(
            summary = "Supprimer un patient",
            description = "Supprime définitivement un patient du système."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Patient supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePatient(
            @Parameter(description = "Identifiant du patient") @PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok("Patient supprimé avec succès.");
    }

    // ============================
    // 🩺 RELATION PATIENT - MÉDECIN
    // ============================

    @Operation(
            summary = "Rattacher un médecin à un patient",
            description = "Permet d'associer un médecin à un patient après l'inscription "
                    + "en utilisant le numéro professionnel du médecin."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Médecin rattaché avec succès",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))),
            @ApiResponse(responseCode = "400", description = "Numéro professionnel invalide"),
            @ApiResponse(responseCode = "404", description = "Patient ou médecin non trouvé")
    })
    @PatchMapping("/{patientId}/rattacher-medecin")
    public PatientResponse rattacherMedecin(
            @Parameter(description = "Identifiant du patient") @PathVariable Long patientId,
            @Parameter(description = "Numéro professionnel du médecin")
            @RequestParam String numeroProfessionnelMedecin
    ) {
        return patientService.rattacherMedecin(patientId, numeroProfessionnelMedecin);
    }

    @Operation(
            summary = "Lister les patients d'un médecin",
            description = "Retourne la liste des patients rattachés à un médecin donné."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des patients récupérée",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))),
            @ApiResponse(responseCode = "404", description = "Médecin non trouvé")
    })
    @GetMapping("/medecin/{medecinId}/patients")
    public List<PatientResponse> getPatientsDuMedecin(
            @Parameter(description = "Identifiant du médecin") @PathVariable Long medecinId) {

        return patientService.getPatientsDuMedecinByMedecinId(medecinId);
    }

    @Operation(
            summary = "Lister les patients visibles pour un médecin",
            description = "Retourne tous les patients visibles par un médecin : "
                    + "patients directs et patients des équipes médicales associées."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des patients visibles récupérée",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))),
            @ApiResponse(responseCode = "400", description = "Identifiant médecin invalide")
    })
    @GetMapping("/medecin/{medecinId}/visibles")
    public ResponseEntity<List<PatientResponse>> getPatientsVisibles(
            @Parameter(description = "Identifiant du médecin") @PathVariable Long medecinId
    ) {
        return ResponseEntity.ok(
                patientService.getPatientsVisiblesPourMedecin(medecinId)
        );
    }

    @Operation(
            summary = "Vérifier si un patient existe",
            description = "Retourne true si le patient existe, false sinon. "
                    + "Utilisé par le communication-service pour valider les conversations."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Vérification effectuée")
    })
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> patientExists(
            @Parameter(description = "Identifiant du patient") @PathVariable Long id
    ) {
        boolean exists = patientService.patientExists(id);
        return ResponseEntity.ok(exists);
    }
}
