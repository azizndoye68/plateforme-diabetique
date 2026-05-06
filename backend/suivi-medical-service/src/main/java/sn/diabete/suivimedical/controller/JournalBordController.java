package sn.diabete.suivimedical.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.suivimedical.dto.JournalBordRequest;
import sn.diabete.suivimedical.dto.JournalBordResponse;
import sn.diabete.suivimedical.service.JournalBordService;

import java.util.List;

@RestController
@RequestMapping("/api/journal-bord")
@RequiredArgsConstructor
@Tag(name = "Journal de bord", description = "Gestion des entrées du journal de bord des patients")
public class JournalBordController {

    private final JournalBordService service;

    @Operation(summary = "Créer une entrée de journal", description = "Ajoute une nouvelle entrée dans le journal de bord d'un patient")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Entrée créée avec succès"),
            @ApiResponse(responseCode = "404", description = "Patient introuvable")
    })
    @PostMapping
    public ResponseEntity<JournalBordResponse> create(@RequestBody JournalBordRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Récupérer une entrée par ID", description = "Retourne une entrée spécifique du journal de bord")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Entrée récupérée avec succès"),
            @ApiResponse(responseCode = "404", description = "Entrée introuvable")
    })
    @GetMapping("/{id}")
    public ResponseEntity<JournalBordResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Récupérer le journal d’un patient", description = "Retourne toutes les entrées du journal de bord d’un patient, triées par date décroissante")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des entrées récupérée avec succès")
    })
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<JournalBordResponse>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @Operation(summary = "Modifier une entrée de journal", description = "Met à jour une entrée existante du journal de bord")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Entrée mise à jour avec succès"),
            @ApiResponse(responseCode = "404", description = "Entrée introuvable")
    })
    @PutMapping("/{id}")
    public ResponseEntity<JournalBordResponse> update(@PathVariable Long id, @RequestBody JournalBordRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @Operation(summary = "Supprimer une entrée de journal", description = "Supprime une entrée spécifique du journal de bord")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Entrée supprimée avec succès"),
            @ApiResponse(responseCode = "404", description = "Entrée introuvable")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
