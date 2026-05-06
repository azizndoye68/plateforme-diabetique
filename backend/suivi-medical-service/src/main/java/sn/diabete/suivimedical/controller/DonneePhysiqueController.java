package sn.diabete.suivimedical.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.suivimedical.dto.DonneePhysiqueRequest;
import sn.diabete.suivimedical.dto.DonneePhysiqueResponse;
import sn.diabete.suivimedical.service.DonneePhysiqueService;

import java.util.List;

@RestController
@RequestMapping("/api/donnees-physiques")
@RequiredArgsConstructor
@Tag(name = "Données Physiques", description = "Gestion des données physiques des patients")
public class DonneePhysiqueController {

    private final DonneePhysiqueService service;

    @Operation(summary = "Créer une donnée physique", description = "Crée une nouvelle donnée physique pour un patient")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Donnée créée avec succès"),
            @ApiResponse(responseCode = "404", description = "Patient introuvable")
    })
    @PostMapping
    public ResponseEntity<DonneePhysiqueResponse> create(
            @RequestBody DonneePhysiqueRequest request
    ) {
        return new ResponseEntity<>(
                service.create(request),
                HttpStatus.CREATED
        );
    }

    @Operation(summary = "Récupérer une donnée par ID", description = "Retourne une donnée physique spécifique à partir de son ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Donnée récupérée avec succès"),
            @ApiResponse(responseCode = "404", description = "Donnée non trouvée")
    })
    @GetMapping("/{id}")
    public ResponseEntity<DonneePhysiqueResponse> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Récupérer toutes les données d’un patient", description = "Retourne la liste de toutes les données physiques d’un patient, triées par date décroissante")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des données récupérée avec succès")
    })
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DonneePhysiqueResponse>> getByPatient(
            @PathVariable Long patientId
    ) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @Operation(summary = "Modifier une donnée physique", description = "Met à jour une donnée physique existante (poids, tension, etc.)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Donnée mise à jour avec succès"),
            @ApiResponse(responseCode = "404", description = "Donnée non trouvée")
    })
    @PutMapping("/{id}")
    public ResponseEntity<DonneePhysiqueResponse> update(
            @PathVariable Long id,
            @RequestBody DonneePhysiqueRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @Operation(summary = "Supprimer une donnée physique", description = "Supprime une donnée physique existante à partir de son ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Donnée supprimée avec succès"),
            @ApiResponse(responseCode = "404", description = "Donnée non trouvée")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
