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
import sn.diabete.patient.dto.ContenuEducatifRequest;
import sn.diabete.patient.dto.ContenuEducatifResponse;
import sn.diabete.patient.service.ContenuEducatifService;

import java.util.List;

@RestController
@RequestMapping("/api/contenus")
@RequiredArgsConstructor
@Tag(name = "Contenu éducatif", description = "Endpoints pour la gestion des contenus éducatifs pour les patients")
public class ContenuEducatifController {

    private final ContenuEducatifService contenuService;

    // ============================
    // 📚 GESTION DES CONTENUS ÉDUCATIFS
    // ============================

    @Operation(
            summary = "Créer un contenu éducatif",
            description = "Permet de créer un contenu éducatif (article, vidéo, document ou lien externe) "
                    + "destiné à la sensibilisation et à l'éducation des patients diabétiques."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contenu éducatif créé avec succès",
                    content = @Content(schema = @Schema(implementation = ContenuEducatifResponse.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    @PostMapping
    public ResponseEntity<ContenuEducatifResponse> create(
            @RequestBody ContenuEducatifRequest request) {
        return ResponseEntity.ok(contenuService.createContenu(request));
    }

    @Operation(
            summary = "Lister tous les contenus éducatifs",
            description = "Retourne la liste complète de tous les contenus éducatifs disponibles dans la plateforme."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des contenus éducatifs récupérée",
                    content = @Content(schema = @Schema(implementation = ContenuEducatifResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<ContenuEducatifResponse>> getAll() {
        return ResponseEntity.ok(contenuService.getAllContenus());
    }

    @Operation(
            summary = "Récupérer un contenu éducatif par ID",
            description = "Retourne les détails d'un contenu éducatif spécifique à partir de son identifiant."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contenu éducatif trouvé",
                    content = @Content(schema = @Schema(implementation = ContenuEducatifResponse.class))),
            @ApiResponse(responseCode = "404", description = "Contenu éducatif non trouvé")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ContenuEducatifResponse> getById(
            @Parameter(description = "Identifiant unique du contenu éducatif")
            @PathVariable Long id) {
        return ResponseEntity.ok(contenuService.getContenuById(id));
    }

    @Operation(
            summary = "Mettre à jour un contenu éducatif",
            description = "Permet de modifier les informations d'un contenu éducatif existant "
                    + "(titre, type ou lien associé)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contenu éducatif mis à jour avec succès",
                    content = @Content(schema = @Schema(implementation = ContenuEducatifResponse.class))),
            @ApiResponse(responseCode = "404", description = "Contenu éducatif non trouvé")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ContenuEducatifResponse> update(
            @Parameter(description = "Identifiant du contenu éducatif")
            @PathVariable Long id,
            @RequestBody ContenuEducatifRequest request) {
        return ResponseEntity.ok(contenuService.updateContenu(id, request));
    }

    @Operation(
            summary = "Supprimer un contenu éducatif",
            description = "Supprime définitivement un contenu éducatif de la plateforme."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Contenu éducatif supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Contenu éducatif non trouvé")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Identifiant du contenu éducatif")
            @PathVariable Long id) {
        contenuService.deleteContenu(id);
        return ResponseEntity.noContent().build();
    }
}
