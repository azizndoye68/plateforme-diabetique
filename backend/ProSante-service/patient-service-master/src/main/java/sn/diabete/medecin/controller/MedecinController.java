package sn.diabete.medecin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.medecin.dto.MedecinRequest;
import sn.diabete.medecin.dto.MedecinResponse;
import sn.diabete.medecin.dto.PatientDTO;
import sn.diabete.medecin.service.MedecinService;
import sn.diabete.medecin.dto.EquipeMedicaleDTO;
import sn.diabete.medecin.dto.CanAccessResponse;

import java.util.List;

@RestController
@RequestMapping("/api/medecins")
@RequiredArgsConstructor
@Tag(name = "Médecins", description = "Endpoints pour gérer les médecins et accéder à leurs patients")
public class MedecinController {

    private final MedecinService medecinService;


    @Operation(summary = "Créer un médecin", description = "Crée un nouveau médecin avec un numéro professionnel unique")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Médecin créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Requête invalide, utilisateurId ou téléphone manquant/déjà utilisé")
    })
    @PostMapping
    public ResponseEntity<MedecinResponse> createMedecin(@Valid @RequestBody MedecinRequest request) {
        MedecinResponse response = medecinService.createMedecin(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Récupérer tous les médecins", description = "Retourne la liste complète des médecins")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des médecins récupérée avec succès")
    })
    @GetMapping
    public ResponseEntity<List<MedecinResponse>> getAllMedecins() {
        return ResponseEntity.ok(medecinService.getAllMedecins());
    }

    @Operation(summary = "Récupérer un médecin par ID", description = "Retourne un médecin correspondant à l'ID fourni")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Médecin récupéré avec succès"),
            @ApiResponse(responseCode = "404", description = "Médecin non trouvé")
    })
    @GetMapping("/{id}")
    public ResponseEntity<MedecinResponse> getMedecinById(@PathVariable Long id) {
        return ResponseEntity.ok(medecinService.getMedecinById(id));
    }

    @Operation(summary = "Récupérer un médecin par utilisateurId", description = "Retourne un médecin correspondant à l'utilisateurId fourni")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Médecin récupéré avec succès"),
            @ApiResponse(responseCode = "404", description = "Médecin non trouvé pour l'utilisateurId fourni")
    })
    @GetMapping("/byUtilisateur/{utilisateurId}")
    public ResponseEntity<MedecinResponse> getMedecinByUtilisateurId(@PathVariable Long utilisateurId) {
        return ResponseEntity.ok(medecinService.getMedecinByUtilisateurId(utilisateurId));
    }

    @Operation(summary = "Mettre à jour un médecin", description = "Met à jour les informations d'un médecin existant")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Médecin mis à jour avec succès"),
            @ApiResponse(responseCode = "404", description = "Médecin non trouvé"),
            @ApiResponse(responseCode = "400", description = "Téléphone déjà utilisé")
    })
    @PutMapping("/{id}")
    public ResponseEntity<MedecinResponse> updateMedecin(@Valid @PathVariable Long id, @RequestBody MedecinRequest request) {
        return ResponseEntity.ok(medecinService.updateMedecin(id, request));
    }

    @Operation(summary = "Supprimer un médecin", description = "Supprime un médecin par son ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Médecin supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Médecin non trouvé")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMedecin(@PathVariable Long id) {
        medecinService.deleteMedecin(id);
        return ResponseEntity.ok("Médecin supprimé avec succès.");
    }

    @Operation(summary = "Récupérer un médecin par numéro professionnel", description = "Retourne un médecin via son numéro professionnel unique")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Médecin récupéré avec succès"),
            @ApiResponse(responseCode = "404", description = "Médecin non trouvé avec ce numéro professionnel")
    })
    @GetMapping("/numero/{numeroProfessionnel}")
    public ResponseEntity<MedecinResponse> getByNumero(@PathVariable String numeroProfessionnel) {
        MedecinResponse medecinDto = medecinService.getMedecinByNumeroProfessionnel(numeroProfessionnel);
        return ResponseEntity.ok(medecinDto);
    }

    @Operation(summary = "Récupérer tous les patients", description = "Retourne la liste de tous les patients (via microservice Patient)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des patients récupérée avec succès")
    })
    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getPatients() {
        return ResponseEntity.ok(medecinService.getPatients());
    }

    // ============================
// 🔌 INTÉGRATION COMMUNICATION-SERVICE
// ============================

    @Operation(
            summary = "Vérifier si un médecin existe",
            description = "Retourne true si le médecin existe, false sinon. "
                    + "Utilisé par le communication-service pour valider les conversations."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vérification effectuée")
    })
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> medecinExists(@PathVariable Long id) {
        boolean exists = medecinService.medecinExists(id);
        return ResponseEntity.ok(exists);
    }

    @Operation(
            summary = "Récupérer l'équipe médicale d'un médecin",
            description = "Retourne l'équipe médicale dont le médecin est propriétaire avec tous ses membres. "
                    + "Utilisé par le communication-service pour diffuser les messages à toute l'équipe."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Équipe médicale récupérée"),
            @ApiResponse(responseCode = "404", description = "Médecin sans équipe ou équipe non trouvée")
    })
    @GetMapping("/{medecinId}/equipe")
    public ResponseEntity<EquipeMedicaleDTO> getEquipeMedicale(@PathVariable Long medecinId) {
        EquipeMedicaleDTO equipe = medecinService.getEquipeMedicale(medecinId);
        return ResponseEntity.ok(equipe);
    }

    @Operation(
            summary = "Vérifier l'accès d'un médecin à un patient",
            description = "Retourne true si le médecin peut accéder au patient "
                    + "(médecin référent ou membre de l'équipe du médecin référent). "
                    + "Utilisé par le communication-service pour valider les autorisations."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vérification effectuée")
    })
    @GetMapping("/{medecinId}/can-access-patient/{patientId}")
    public ResponseEntity<CanAccessResponse> canAccessPatient(
            @PathVariable Long medecinId,
            @PathVariable Long patientId
    ) {
        boolean canAccess = medecinService.canAccessPatient(medecinId, patientId);
        return ResponseEntity.ok(new CanAccessResponse(canAccess));
    }

}
