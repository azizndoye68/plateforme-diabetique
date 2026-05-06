package sn.diabete.patient.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.patient.dto.DossierMedicalRequest;
import sn.diabete.patient.dto.DossierMedicalResponse;
import sn.diabete.patient.service.DossierMedicalService;

import java.util.List;

@RestController
@RequestMapping("/api/dossiers")
@RequiredArgsConstructor
@Tag(name = "Dossier Médical", description = "Endpoints pour la gestion des dossiers médicaux des patients")
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;

    @Operation(
            summary = "Créer un dossier médical",
            description = "Permet de créer un dossier médical pour un patient. Un patient ne peut avoir qu’un seul dossier médical."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dossier médical créé avec succès",
                    content = @Content(schema = @Schema(implementation = DossierMedicalResponse.class))),
            @ApiResponse(responseCode = "400", description = "Le patient possède déjà un dossier médical"),
            @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @PostMapping
    public ResponseEntity<DossierMedicalResponse> create(
            @RequestBody DossierMedicalRequest request) {
        return ResponseEntity.ok(dossierMedicalService.createDossier(request));
    }

    @Operation(
            summary = "Récupérer un dossier médical par ID",
            description = "Retourne les informations complètes d’un dossier médical à partir de son identifiant."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dossier médical récupéré avec succès",
                    content = @Content(schema = @Schema(implementation = DossierMedicalResponse.class))),
            @ApiResponse(responseCode = "404", description = "Dossier médical non trouvé")
    })
    @GetMapping("/{id}")
    public ResponseEntity<DossierMedicalResponse> getById(
            @Parameter(description = "ID du dossier médical") @PathVariable Long id) {
        return ResponseEntity.ok(dossierMedicalService.getDossierById(id));
    }

    @Operation(
            summary = "Récupérer le dossier médical d’un patient",
            description = "Retourne le dossier médical associé à un patient donné."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dossier médical du patient récupéré",
                    content = @Content(schema = @Schema(implementation = DossierMedicalResponse.class))),
            @ApiResponse(responseCode = "404", description = "Dossier médical ou patient non trouvé")
    })
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<DossierMedicalResponse> getByPatient(
            @PathVariable Long patientId) {
        DossierMedicalResponse dossier = dossierMedicalService.getDossierByPatientId(patientId);
        // ✅ 204 si pas de dossier, 200 avec données sinon
        if (dossier == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dossier);
    }

    @Operation(
            summary = "Lister tous les dossiers médicaux",
            description = "Retourne la liste complète de tous les dossiers médicaux enregistrés dans le système."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des dossiers médicaux récupérée",
                    content = @Content(schema = @Schema(implementation = DossierMedicalResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<DossierMedicalResponse>> getAll() {
        return ResponseEntity.ok(dossierMedicalService.getAllDossiers());
    }

    @Operation(
            summary = "Mettre à jour un dossier médical",
            description = "Permet de modifier les informations médicales d’un dossier existant."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dossier médical mis à jour avec succès",
                    content = @Content(schema = @Schema(implementation = DossierMedicalResponse.class))),
            @ApiResponse(responseCode = "404", description = "Dossier médical non trouvé")
    })
    @PutMapping("/{id}")
    public ResponseEntity<DossierMedicalResponse> update(
            @Parameter(description = "ID du dossier médical") @PathVariable Long id,
            @RequestBody DossierMedicalRequest request) {
        return ResponseEntity.ok(dossierMedicalService.updateDossier(id, request));
    }

    @Operation(
            summary = "Supprimer un dossier médical",
            description = "Supprime un dossier médical à partir de son ID. La relation avec le patient est automatiquement rompue."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Dossier médical supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Dossier médical non trouvé")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID du dossier médical") @PathVariable Long id) {
        dossierMedicalService.deleteDossier(id);
        return ResponseEntity.noContent().build();
    }
}
