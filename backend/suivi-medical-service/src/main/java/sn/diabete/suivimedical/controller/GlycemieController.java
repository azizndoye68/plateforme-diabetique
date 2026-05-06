package sn.diabete.suivimedical.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.suivimedical.dto.GlycemieRequest;
import sn.diabete.suivimedical.dto.GlycemieResponse;
import sn.diabete.suivimedical.service.GlycemieService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/suivis")
@RequiredArgsConstructor
@Tag(name = "Glycémie", description = "Gestion des mesures de glycémie des patients")
public class GlycemieController {

    private final GlycemieService glycemieService;

    @Operation(summary = "Créer un suivi glycémie", description = "Crée une nouvelle mesure de glycémie pour un patient")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Suivi créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Requête invalide ou patientId manquant"),
            @ApiResponse(responseCode = "404", description = "Patient introuvable")
    })
    @PostMapping
    public ResponseEntity<GlycemieResponse> createSuivi(@RequestBody GlycemieRequest glycemieRequest) {
        GlycemieResponse glycemieResponse = glycemieService.createSuivi(glycemieRequest);
        return ResponseEntity.ok(glycemieResponse);
    }

    @Operation(summary = "Récupérer tous les suivis glycémie", description = "Retourne la liste de toutes les mesures de glycémie")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des suivis récupérée avec succès")
    })
    @GetMapping
    public ResponseEntity<List<GlycemieResponse>> getAllSuivis() {
        List<GlycemieResponse> suivis = glycemieService.getAllSuivis();
        return ResponseEntity.ok(suivis);
    }

    @Operation(summary = "Récupérer un suivi par ID", description = "Retourne une mesure de glycémie spécifique à partir de son ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Suivi récupéré avec succès"),
            @ApiResponse(responseCode = "404", description = "Suivi introuvable")
    })
    @GetMapping("/{id}")
    public ResponseEntity<GlycemieResponse> getSuiviById(@PathVariable Long id) {
        GlycemieResponse glycemieResponse = glycemieService.getSuiviById(id);
        return ResponseEntity.ok(glycemieResponse);
    }

    @Operation(summary = "Mettre à jour un suivi glycémie", description = "Met à jour une mesure existante (glycémie, moment, repas)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Suivi mis à jour avec succès"),
            @ApiResponse(responseCode = "404", description = "Suivi introuvable")
    })
    @PutMapping("/{id}")
    public ResponseEntity<GlycemieResponse> updateSuivi(@PathVariable Long id, @RequestBody GlycemieRequest glycemieRequest) {
        GlycemieResponse updatedSuivi = glycemieService.updateSuivi(id, glycemieRequest);
        return ResponseEntity.ok(updatedSuivi);
    }

    @Operation(summary = "Supprimer un suivi glycémie", description = "Supprime une mesure existante à partir de son ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Suivi supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Suivi introuvable")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSuivi(@PathVariable Long id) {
        glycemieService.deleteSuivi(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Dernière mesure de glycémie", description = "Retourne la dernière mesure de glycémie d'un patient")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dernière mesure récupérée"),
            @ApiResponse(responseCode = "404", description = "Aucune mesure trouvée pour le patient")
    })
    @GetMapping("/last")
    public ResponseEntity<GlycemieResponse> getLastGlycemie(@RequestParam Long patientId) {
        GlycemieResponse dernierSuivi = glycemieService.getLastSuiviByPatientId(patientId);
        // ✅ 204 si aucune mesure, 200 avec données sinon
        if (dernierSuivi == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dernierSuivi);
    }

    @Operation(summary = "Les 7 dernières mesures", description = "Retourne les 7 dernières mesures de glycémie pour un patient")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des mesures récupérée avec succès")
    })
    @GetMapping("/recentes")
    public ResponseEntity<List<GlycemieResponse>> getRecentSuivis(@RequestParam Long patientId) {
        List<GlycemieResponse> suivis = glycemieService.getRecentSuivisByPatientId(patientId);
        return ResponseEntity.ok(suivis);
    }

    @Operation(summary = "Dernière date de mesure", description = "Retourne la date de la dernière mesure de glycémie pour un patient")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Date récupérée avec succès"),
            @ApiResponse(responseCode = "404", description = "Aucune mesure trouvée pour le patient")
    })
    @GetMapping("/patient/{patientId}/last-date")
    public ResponseEntity<LocalDateTime> getLastMeasurementDate(@PathVariable Long patientId) {
        try {
            GlycemieResponse lastGlycemie = glycemieService.getLastSuiviByPatientId(patientId);
            return ResponseEntity.ok(lastGlycemie.getDateSuivi());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
