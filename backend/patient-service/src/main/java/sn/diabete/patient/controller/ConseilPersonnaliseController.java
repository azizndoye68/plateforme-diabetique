package sn.diabete.patient.controller;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sn.diabete.patient.dto.ConseilPersonnaliseRequest;
import sn.diabete.patient.dto.ConseilPersonnaliseResponse;
import sn.diabete.patient.entity.TypeConseil;
import sn.diabete.patient.service.ConseilPersonnaliseService;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/conseils")
@RequiredArgsConstructor
@Tag(name = "Conseil personnalisé", description = "Gestion des conseils de santé (texte, vidéo, PDF)")
public class ConseilPersonnaliseController {

    private final ConseilPersonnaliseService conseilService;

    // ───────────────────────────────────────────────
    // Créer un conseil texte ou vidéo (JSON)
    // ───────────────────────────────────────────────
    @Operation(
            summary = "Créer un conseil (texte ou vidéo)",
            description = "Crée un conseil de type TEXTE ou VIDEO. Pour un PDF, utiliser POST /pdf."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conseil créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @PostMapping
    public ResponseEntity<ConseilPersonnaliseResponse> create(
            @RequestBody ConseilPersonnaliseRequest request) {
        return ResponseEntity.ok(conseilService.createConseil(request));
    }

    // ───────────────────────────────────────────────
    // Créer un conseil PDF (multipart)
    // ───────────────────────────────────────────────
    @Operation(
            summary = "Créer un conseil avec fichier PDF",
            description = "Upload un PDF et crée un conseil de type PDF pour le patient."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Conseil PDF créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Fichier invalide ou données manquantes"),
            @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @PostMapping(value = "/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ConseilPersonnaliseResponse> createAvecPdf(
            @RequestPart("conseil") ConseilPersonnaliseRequest request,
            @RequestPart("fichier") MultipartFile fichierPdf) throws IOException {
        ConseilPersonnaliseResponse response = conseilService.createConseilAvecPdf(request, fichierPdf);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ───────────────────────────────────────────────
    // Lister tous les conseils
    // ───────────────────────────────────────────────
    @Operation(summary = "Lister tous les conseils personnalisés")
    @GetMapping
    public ResponseEntity<List<ConseilPersonnaliseResponse>> getAll() {
        return ResponseEntity.ok(conseilService.getAllConseils());
    }

    // ───────────────────────────────────────────────
    // Récupérer un conseil par ID
    // ───────────────────────────────────────────────
    @Operation(summary = "Récupérer un conseil par ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conseil trouvé"),
            @ApiResponse(responseCode = "404", description = "Conseil non trouvé")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ConseilPersonnaliseResponse> getById(
            @Parameter(description = "ID du conseil") @PathVariable Long id) {
        return ResponseEntity.ok(conseilService.getConseilById(id));
    }

    // ───────────────────────────────────────────────
    // Lister les conseils d'un patient (filtre par type optionnel)
    // ───────────────────────────────────────────────
    @Operation(
            summary = "Conseils d'un patient",
            description = "Retourne tous les conseils d'un patient. Filtre optionnel : ?type=VIDEO"
    )
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ConseilPersonnaliseResponse>> getByPatient(
            @Parameter(description = "ID du patient") @PathVariable Long patientId,
            @Parameter(description = "Filtrer par type : TEXTE, VIDEO, PDF")
            @RequestParam(required = false) TypeConseil type) {
        return ResponseEntity.ok(conseilService.getConseilsByPatientId(patientId, type));
    }

    // ───────────────────────────────────────────────
    // Télécharger le PDF d'un conseil
    // ───────────────────────────────────────────────
    @Operation(
            summary = "Télécharger le PDF d'un conseil",
            description = "Retourne le fichier PDF associé à un conseil de type PDF."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Fichier PDF retourné"),
            @ApiResponse(responseCode = "404", description = "Conseil ou fichier non trouvé")
    })
    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(
            @Parameter(description = "ID du conseil") @PathVariable Long id) {

        String chemin = conseilService.getCheminPdfById(id);
        ConseilPersonnaliseResponse conseil = conseilService.getConseilById(id);

        if (chemin == null || conseil.getNomFichierPdf() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path fichier = Paths.get(chemin).toAbsolutePath();
            Resource resource = new UrlResource(fichier.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + conseil.getNomFichierPdf() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ───────────────────────────────────────────────
    // Mettre à jour un conseil (texte ou vidéo)
    // ───────────────────────────────────────────────
    @Operation(summary = "Mettre à jour un conseil (texte ou vidéo)")
    @PutMapping("/{id}")
    public ResponseEntity<ConseilPersonnaliseResponse> update(
            @Parameter(description = "ID du conseil") @PathVariable Long id,
            @RequestBody ConseilPersonnaliseRequest request) {
        return ResponseEntity.ok(conseilService.updateConseil(id, request));
    }

    // ───────────────────────────────────────────────
    // Mettre à jour le PDF d'un conseil
    // ───────────────────────────────────────────────
    @Operation(summary = "Remplacer le PDF d'un conseil existant")
    @PutMapping(value = "/{id}/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ConseilPersonnaliseResponse> updatePdf(
            @Parameter(description = "ID du conseil") @PathVariable Long id,
            @RequestPart("fichier") MultipartFile fichierPdf) throws IOException {
        return ResponseEntity.ok(conseilService.updateConseilPdf(id, fichierPdf));
    }

    // ───────────────────────────────────────────────
    // Supprimer un conseil
    // ───────────────────────────────────────────────
    @Operation(summary = "Supprimer un conseil personnalisé")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Conseil supprimé"),
            @ApiResponse(responseCode = "404", description = "Conseil non trouvé")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID du conseil") @PathVariable Long id) {
        conseilService.deleteConseil(id);
        return ResponseEntity.noContent().build();
    }
}