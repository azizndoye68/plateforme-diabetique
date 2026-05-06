package sn.diabete.medecin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.medecin.dto.RendezVousRequest;
import sn.diabete.medecin.dto.RendezVousResponse;
import sn.diabete.medecin.entity.StatutRendezVous;
import sn.diabete.medecin.service.RendezVousService;

import java.util.List;

@RestController
@RequestMapping("/api/rendezvous")
@RequiredArgsConstructor
@Tag(name = "Rendez-vous", description = "Endpoints pour gérer les rendez-vous patients / médecins")
public class RendezVousController {

    private final RendezVousService rendezVousService;

    @Operation(summary = "Créer un rendez-vous", description = "Crée un nouveau rendez-vous pour un patient et un médecin")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Rendez-vous créé avec succès"),
            @ApiResponse(responseCode = "404", description = "Patient ou médecin introuvable")
    })
    @PostMapping
    public ResponseEntity<RendezVousResponse> creerRendezVous(@RequestBody RendezVousRequest request) {
        RendezVousResponse response = rendezVousService.creerRendezVous(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Récupérer tous les rendez-vous", description = "Retourne la liste complète de tous les rendez-vous")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des rendez-vous récupérée avec succès")
    })
    @GetMapping
    public ResponseEntity<List<RendezVousResponse>> getAllRendezVous() {
        return ResponseEntity.ok(rendezVousService.getAllRendezVous());
    }

    @Operation(summary = "Récupérer les rendez-vous d’un patient", description = "Retourne tous les rendez-vous d’un patient donné")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des rendez-vous du patient récupérée avec succès")
    })
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RendezVousResponse>> getRendezVousByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(rendezVousService.getRendezVousByPatient(patientId));
    }

    @Operation(summary = "Récupérer les rendez-vous d’un médecin", description = "Retourne tous les rendez-vous d’un médecin donné")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des rendez-vous du médecin récupérée avec succès")
    })
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<RendezVousResponse>> getRendezVousByMedecin(@PathVariable Long medecinId) {
        return ResponseEntity.ok(rendezVousService.getRendezVousByMedecin(medecinId));
    }

    @Operation(summary = "Mettre à jour un rendez-vous", description = "Met à jour les informations d’un rendez-vous (date, motif, statut, médecin)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rendez-vous mis à jour avec succès"),
            @ApiResponse(responseCode = "404", description = "Rendez-vous ou médecin introuvable")
    })
    @PutMapping("/{id}")
    public ResponseEntity<RendezVousResponse> updateRendezVous(
            @PathVariable Long id,
            @RequestBody RendezVousRequest request) {
        return ResponseEntity.ok(rendezVousService.updateRendezVous(id, request));
    }

    @Operation(summary = "Mettre à jour le statut d’un rendez-vous", description = "Met à jour uniquement le statut du rendez-vous")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statut du rendez-vous mis à jour avec succès"),
            @ApiResponse(responseCode = "400", description = "Statut invalide fourni"),
            @ApiResponse(responseCode = "404", description = "Rendez-vous introuvable")
    })
    @PatchMapping("/{id}/statut")
    public ResponseEntity<RendezVousResponse> updateStatut(
            @PathVariable Long id,
            @RequestParam String statut) {
        StatutRendezVous newStatut;
        try {
            newStatut = StatutRendezVous.valueOf(statut.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(rendezVousService.updateStatut(id, newStatut));
    }

    @Operation(summary = "Supprimer un rendez-vous", description = "Supprime un rendez-vous par son ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rendez-vous supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Rendez-vous introuvable")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRendezVous(@PathVariable Long id) {
        rendezVousService.deleteRendezVous(id);
        return ResponseEntity.ok("Rendez-vous supprimé avec succès");
    }
}
