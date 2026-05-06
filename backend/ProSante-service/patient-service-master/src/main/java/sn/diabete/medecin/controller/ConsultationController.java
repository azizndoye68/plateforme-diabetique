package sn.diabete.medecin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.medecin.dto.ConsultationRequest;
import sn.diabete.medecin.dto.ConsultationResponse;
import sn.diabete.medecin.service.ConsultationService;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultations", description = "Endpoints pour gérer les consultations entre patients et médecins")
public class ConsultationController {

    private final ConsultationService consultationService;

    // ----------------- CREATE -----------------
    @Operation(summary = "Créer une consultation", description = "Permet de créer une nouvelle consultation pour un patient avec un médecin.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Consultation créée avec succès",
                    content = @Content(schema = @Schema(implementation = ConsultationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Patient ou médecin introuvable")
    })
    @PostMapping
    public ResponseEntity<ConsultationResponse> creerConsultation(
            @RequestBody ConsultationRequest request) {

        return new ResponseEntity<>(
                consultationService.creerConsultation(request),
                HttpStatus.CREATED);
    }

    // ----------------- READ ALL -----------------
    @Operation(summary = "Lister toutes les consultations", description = "Retourne la liste complète des consultations enregistrées.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des consultations récupérée",
                    content = @Content(schema = @Schema(implementation = ConsultationResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<ConsultationResponse>> getAllConsultations() {
        return ResponseEntity.ok(
                consultationService.getAllConsultations());
    }

    // ----------------- READ BY ID -----------------
    @Operation(summary = "Récupérer une consultation par ID", description = "Retourne les détails d'une consultation spécifique en fonction de son ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Consultation trouvée",
                    content = @Content(schema = @Schema(implementation = ConsultationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Consultation introuvable")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ConsultationResponse> getConsultationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                consultationService.getConsultationById(id));
    }

    // ----------------- READ BY MEDECIN -----------------
    @Operation(summary = "Récupérer les consultations d'un médecin", description = "Retourne toutes les consultations associées à un médecin donné.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des consultations du médecin récupérée",
                    content = @Content(schema = @Schema(implementation = ConsultationResponse.class)))
    })
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<ConsultationResponse>> getConsultationsByMedecin(
            @PathVariable Long medecinId) {

        return ResponseEntity.ok(
                consultationService.getConsultationsByMedecin(medecinId));
    }

    // ----------------- READ BY PATIENT -----------------
    @Operation(summary = "Récupérer les consultations d'un patient", description = "Retourne toutes les consultations associées à un patient donné.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des consultations du patient récupérée",
                    content = @Content(schema = @Schema(implementation = ConsultationResponse.class)))
    })
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ConsultationResponse>> getConsultationsByPatient(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                consultationService.getConsultationsByPatient(patientId));
    }

    // ----------------- UPDATE -----------------
    @Operation(summary = "Mettre à jour une consultation", description = "Permet de modifier les détails d'une consultation existante.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Consultation mise à jour avec succès",
                    content = @Content(schema = @Schema(implementation = ConsultationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Consultation ou médecin introuvable")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ConsultationResponse> updateConsultation(
            @PathVariable Long id,
            @RequestBody ConsultationRequest request) {

        return ResponseEntity.ok(
                consultationService.updateConsultation(id, request));
    }

    // ----------------- DELETE -----------------
    @Operation(summary = "Supprimer une consultation", description = "Permet de supprimer une consultation en fonction de son ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Consultation supprimée avec succès"),
            @ApiResponse(responseCode = "404", description = "Consultation introuvable")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteConsultation(
            @PathVariable Long id) {

        consultationService.deleteConsultation(id);
        return ResponseEntity.ok("Consultation supprimée avec succès");
    }
}
