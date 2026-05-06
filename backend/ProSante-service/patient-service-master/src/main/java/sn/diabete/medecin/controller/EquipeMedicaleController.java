package sn.diabete.medecin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.medecin.dto.EquipeMedicaleRequest;
import sn.diabete.medecin.dto.EquipeMedicaleResponse;
import sn.diabete.medecin.service.EquipeMedicaleService;

import java.util.List;

@RestController
@RequestMapping("/api/equipes-medicales")
@RequiredArgsConstructor
@Tag(name = "Équipe Médicale", description = "Endpoints pour gérer les équipes médicales et leurs membres")
public class EquipeMedicaleController {

    private final EquipeMedicaleService service;

    /* ============================================================
       CRÉATION
       ============================================================ */
    @Operation(summary = "Créer une équipe médicale", description = "Permet de créer une nouvelle équipe médicale avec un médecin propriétaire.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Équipe créée avec succès",
                    content = @Content(schema = @Schema(implementation = EquipeMedicaleResponse.class))),
            @ApiResponse(responseCode = "404", description = "Médecin propriétaire introuvable"),
            @ApiResponse(responseCode = "400", description = "Nom de l'équipe manquant ou invalide")
    })
    @PostMapping
    public ResponseEntity<EquipeMedicaleResponse> creerEquipe(
            @RequestBody EquipeMedicaleRequest request,
            @RequestParam Long medecinId
    ) {
        return ResponseEntity.ok(service.creerEquipe(request, medecinId));
    }

    /* ============================================================
       AJOUT / RETRAIT DE MÉDECINS
       ============================================================ */
    @Operation(summary = "Ajouter un médecin à une équipe", description = "Permet au propriétaire d'ajouter un médecin à son équipe.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Médecin ajouté avec succès",
                    content = @Content(schema = @Schema(implementation = EquipeMedicaleResponse.class))),
            @ApiResponse(responseCode = "404", description = "Équipe ou médecin introuvable"),
            @ApiResponse(responseCode = "400", description = "Médecin déjà membre ou accès refusé")
    })
    @PostMapping("/{equipeId}/medecins/{medecinAajouterId}")
    public ResponseEntity<EquipeMedicaleResponse> ajouterMedecin(
            @PathVariable Long equipeId,
            @PathVariable Long medecinAajouterId,
            @RequestParam Long medecinProprietaireId
    ) {
        return ResponseEntity.ok(
                service.ajouterMedecin(equipeId, medecinAajouterId, medecinProprietaireId)
        );
    }

    @Operation(summary = "Retirer un médecin d'une équipe", description = "Permet au propriétaire de retirer un médecin de son équipe.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Médecin retiré avec succès",
                    content = @Content(schema = @Schema(implementation = EquipeMedicaleResponse.class))),
            @ApiResponse(responseCode = "404", description = "Équipe ou médecin introuvable"),
            @ApiResponse(responseCode = "400", description = "Impossible de retirer le propriétaire ou médecin non membre")
    })
    @DeleteMapping("/{equipeId}/medecins/{medecinAretirerId}")
    public ResponseEntity<EquipeMedicaleResponse> retirerMedecin(
            @PathVariable Long equipeId,
            @PathVariable Long medecinAretirerId,
            @RequestParam Long medecinProprietaireId
    ) {
        return ResponseEntity.ok(
                service.retirerMedecin(equipeId, medecinAretirerId, medecinProprietaireId)
        );
    }

    /* ============================================================
       CONSULTATION
       ============================================================ */
    @Operation(summary = "Lister toutes les équipes", description = "Retourne toutes les équipes médicales (admin / debug).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des équipes récupérée",
                    content = @Content(schema = @Schema(implementation = EquipeMedicaleResponse.class)))
    })
    @GetMapping("/all")
    public ResponseEntity<List<EquipeMedicaleResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Lister les équipes d'un médecin", description = "Retourne toutes les équipes auxquelles appartient un médecin.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des équipes du médecin récupérée",
                    content = @Content(schema = @Schema(implementation = EquipeMedicaleResponse.class))),
            @ApiResponse(responseCode = "404", description = "Médecin introuvable")
    })
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<EquipeMedicaleResponse>> getEquipesDuMedecin(
            @PathVariable Long medecinId
    ) {
        return ResponseEntity.ok(service.getEquipesDuMedecin(medecinId));
    }

    @Operation(summary = "Détails d'une équipe", description = "Retourne les informations détaillées d'une équipe accessible uniquement aux membres.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Détails de l'équipe récupérés",
                    content = @Content(schema = @Schema(implementation = EquipeMedicaleResponse.class))),
            @ApiResponse(responseCode = "404", description = "Équipe introuvable"),
            @ApiResponse(responseCode = "403", description = "Accès refusé : médecin non membre")
    })
    @GetMapping("/{equipeId}")
    public ResponseEntity<EquipeMedicaleResponse> getEquipeById(
            @PathVariable Long equipeId,
            @RequestParam Long medecinId
    ) {
        return ResponseEntity.ok(service.getEquipeById(equipeId, medecinId));
    }

    /* ============================================================
       MODIFICATION
       ============================================================ */
    @Operation(summary = "Modifier le nom d'une équipe", description = "Permet au propriétaire de modifier le nom de son équipe.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Nom modifié avec succès",
                    content = @Content(schema = @Schema(implementation = EquipeMedicaleResponse.class))),
            @ApiResponse(responseCode = "404", description = "Équipe introuvable"),
            @ApiResponse(responseCode = "400", description = "Nom invalide ou accès refusé")
    })
    @PutMapping("/{equipeId}/nom")
    public ResponseEntity<EquipeMedicaleResponse> modifierNomEquipe(
            @PathVariable Long equipeId,
            @RequestParam String nouveauNom,
            @RequestParam Long medecinProprietaireId
    ) {
        return ResponseEntity.ok(
                service.modifierNomEquipe(equipeId, nouveauNom, medecinProprietaireId)
        );
    }

    /* ============================================================
       SUPPRESSION
       ============================================================ */
    @Operation(summary = "Supprimer une équipe", description = "Permet au propriétaire de supprimer son équipe médicale.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Équipe supprimée avec succès"),
            @ApiResponse(responseCode = "404", description = "Équipe introuvable"),
            @ApiResponse(responseCode = "403", description = "Accès refusé : non-propriétaire")
    })
    @DeleteMapping("/{equipeId}")
    public ResponseEntity<Void> supprimerEquipe(
            @PathVariable Long equipeId,
            @RequestParam Long medecinProprietaireId
    ) {
        service.supprimerEquipe(equipeId, medecinProprietaireId);
        return ResponseEntity.noContent().build();
    }
}
