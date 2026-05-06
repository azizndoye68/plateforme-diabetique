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
import sn.diabete.patient.dto.ObjectifSanteRequest;
import sn.diabete.patient.dto.ObjectifSanteResponse;
import sn.diabete.patient.service.ObjectifSanteService;

import java.util.List;

@RestController
@RequestMapping("/api/objectifs")
@RequiredArgsConstructor
@Tag(name = "Objectif Santé", description = "Endpoints pour la gestion des objectifs de santé des patients")
public class ObjectifSanteController {

    private final ObjectifSanteService objectifSanteService;

    @Operation(
            summary = "Créer un objectif de santé",
            description = "Permet de créer un objectif de santé personnalisé pour un patient donné."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Objectif de santé créé avec succès",
                    content = @Content(schema = @Schema(implementation = ObjectifSanteResponse.class))),
            @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @PostMapping
    public ResponseEntity<ObjectifSanteResponse> create(
            @RequestBody ObjectifSanteRequest request) {
        return ResponseEntity.ok(objectifSanteService.createObjectif(request));
    }

    @Operation(
            summary = "Lister tous les objectifs de santé",
            description = "Retourne la liste complète de tous les objectifs de santé enregistrés dans le système."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des objectifs de santé récupérée",
                    content = @Content(schema = @Schema(implementation = ObjectifSanteResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<ObjectifSanteResponse>> getAll() {
        return ResponseEntity.ok(objectifSanteService.getAllObjectifs());
    }

    @Operation(
            summary = "Lister les objectifs de santé d’un patient",
            description = "Retourne tous les objectifs de santé associés à un patient spécifique."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Objectifs du patient récupérés",
                    content = @Content(schema = @Schema(implementation = ObjectifSanteResponse.class))),
            @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ObjectifSanteResponse>> getByPatient(
            @Parameter(description = "ID du patient") @PathVariable Long patientId) {
        return ResponseEntity.ok(objectifSanteService.getObjectifsByPatient(patientId));
    }

    @Operation(
            summary = "Récupérer un objectif de santé par ID",
            description = "Retourne les détails d’un objectif de santé à partir de son identifiant."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Objectif de santé récupéré avec succès",
                    content = @Content(schema = @Schema(implementation = ObjectifSanteResponse.class))),
            @ApiResponse(responseCode = "404", description = "Objectif de santé non trouvé")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ObjectifSanteResponse> getById(
            @Parameter(description = "ID de l’objectif de santé") @PathVariable Long id) {
        return ResponseEntity.ok(objectifSanteService.getObjectifById(id));
    }

    @Operation(
            summary = "Mettre à jour un objectif de santé",
            description = "Permet de modifier les informations d’un objectif de santé existant."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Objectif de santé mis à jour avec succès",
                    content = @Content(schema = @Schema(implementation = ObjectifSanteResponse.class))),
            @ApiResponse(responseCode = "404", description = "Objectif de santé ou patient non trouvé")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ObjectifSanteResponse> update(
            @Parameter(description = "ID de l’objectif de santé") @PathVariable Long id,
            @RequestBody ObjectifSanteRequest request) {
        return ResponseEntity.ok(objectifSanteService.updateObjectif(id, request));
    }

    @Operation(
            summary = "Supprimer un objectif de santé",
            description = "Supprime un objectif de santé à partir de son identifiant."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Objectif de santé supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Objectif de santé non trouvé")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID de l’objectif de santé") @PathVariable Long id) {
        objectifSanteService.deleteObjectif(id);
        return ResponseEntity.noContent().build();
    }
}
