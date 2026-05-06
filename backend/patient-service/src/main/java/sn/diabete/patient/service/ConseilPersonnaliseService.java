package sn.diabete.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sn.diabete.patient.dto.ConseilPersonnaliseRequest;
import sn.diabete.patient.dto.ConseilPersonnaliseResponse;
import sn.diabete.patient.entity.ConseilPersonnalise;
import sn.diabete.patient.entity.Patient;
import sn.diabete.patient.entity.TypeConseil;
import sn.diabete.patient.exception.ResourceNotFoundException;
import sn.diabete.patient.exception.ValidationException;
import sn.diabete.patient.repository.ConseilPersonnaliseRepository;
import sn.diabete.patient.repository.PatientRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConseilPersonnaliseService {

    private final ConseilPersonnaliseRepository conseilRepository;
    private final PatientRepository patientRepository;

    @Value("${app.upload.dir:uploads/conseils}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // ─────────────────────────────────────────────
    // Créer un conseil (texte ou vidéo)
    // ─────────────────────────────────────────────
    public ConseilPersonnaliseResponse createConseil(ConseilPersonnaliseRequest request) {
        validerRequest(request, null);
        Patient patient = findPatient(request.getPatientId());

        ConseilPersonnalise conseil = ConseilPersonnalise.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .typeConseil(request.getTypeConseil())
                .lienVideo(request.getLienVideo())
                .patient(patient)
                .build();

        return toResponse(conseilRepository.save(conseil));
    }

    // ─────────────────────────────────────────────
    // Créer un conseil avec PDF uploadé
    // ─────────────────────────────────────────────
    public ConseilPersonnaliseResponse createConseilAvecPdf(
            ConseilPersonnaliseRequest request, MultipartFile fichierPdf) throws IOException {

        if (fichierPdf == null || fichierPdf.isEmpty()) {
            throw new ValidationException("Le fichier PDF est requis pour un conseil de type PDF.");
        }
        validerPdf(fichierPdf);

        Patient patient = findPatient(request.getPatientId());
        String cheminFichier = sauvegarderPdf(fichierPdf);

        ConseilPersonnalise conseil = ConseilPersonnalise.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .typeConseil(TypeConseil.PDF)
                .cheminFichierPdf(cheminFichier)
                .nomFichierPdf(fichierPdf.getOriginalFilename())
                .patient(patient)
                .build();

        return toResponse(conseilRepository.save(conseil));
    }

    // ─────────────────────────────────────────────
    // Récupérer tous les conseils
    // ─────────────────────────────────────────────
    public List<ConseilPersonnaliseResponse> getAllConseils() {
        return conseilRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // Récupérer un conseil par ID
    // ─────────────────────────────────────────────
    public ConseilPersonnaliseResponse getConseilById(Long id) {
        return toResponse(findConseil(id));
    }

    // ─────────────────────────────────────────────
    // Récupérer les conseils d'un patient (avec filtre optionnel par type)
    // ─────────────────────────────────────────────
    public List<ConseilPersonnaliseResponse> getConseilsByPatientId(Long patientId, TypeConseil type) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient non trouvé avec l'ID : " + patientId);
        }

        List<ConseilPersonnalise> conseils = (type != null)
                ? conseilRepository.findByPatientIdAndTypeConseil(patientId, type)
                : conseilRepository.findByPatientId(patientId);

        return conseils.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // Mettre à jour un conseil (texte ou vidéo)
    // ─────────────────────────────────────────────
    public ConseilPersonnaliseResponse updateConseil(Long id, ConseilPersonnaliseRequest request) {
        ConseilPersonnalise conseil = findConseil(id);
        validerRequest(request, conseil);

        conseil.setTitre(request.getTitre());
        conseil.setDescription(request.getDescription());
        conseil.setTypeConseil(request.getTypeConseil());
        conseil.setLienVideo(request.getLienVideo());

        // Réinitialiser le PDF si on change de type
        if (request.getTypeConseil() != TypeConseil.PDF) {
            supprimerFichierPdf(conseil.getCheminFichierPdf());
            conseil.setCheminFichierPdf(null);
            conseil.setNomFichierPdf(null);
        }

        if (!conseil.getPatient().getId().equals(request.getPatientId())) {
            conseil.setPatient(findPatient(request.getPatientId()));
        }

        return toResponse(conseilRepository.save(conseil));
    }

    // ─────────────────────────────────────────────
    // Mettre à jour le PDF d'un conseil existant
    // ─────────────────────────────────────────────
    public ConseilPersonnaliseResponse updateConseilPdf(Long id, MultipartFile fichierPdf) throws IOException {
        ConseilPersonnalise conseil = findConseil(id);
        validerPdf(fichierPdf);

        // Supprimer l'ancien fichier PDF si existant
        supprimerFichierPdf(conseil.getCheminFichierPdf());

        String cheminFichier = sauvegarderPdf(fichierPdf);
        conseil.setTypeConseil(TypeConseil.PDF);
        conseil.setCheminFichierPdf(cheminFichier);
        conseil.setNomFichierPdf(fichierPdf.getOriginalFilename());
        conseil.setLienVideo(null);

        return toResponse(conseilRepository.save(conseil));
    }

    // ─────────────────────────────────────────────
    // Supprimer un conseil
    // ─────────────────────────────────────────────
    public void deleteConseil(Long id) {
        ConseilPersonnalise conseil = findConseil(id);
        supprimerFichierPdf(conseil.getCheminFichierPdf());
        conseilRepository.delete(conseil);
    }

    // ══════════════════════════════════════════════
    // Méthodes privées utilitaires
    // ══════════════════════════════════════════════

    private Patient findPatient(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient non trouvé avec l'ID : " + patientId));
    }

    private ConseilPersonnalise findConseil(Long id) {
        return conseilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Conseil non trouvé avec l'ID : " + id));
    }

    private void validerRequest(ConseilPersonnaliseRequest request, ConseilPersonnalise existing) {
        if (request.getTypeConseil() == null) {
            throw new ValidationException("Le type de conseil est obligatoire (TEXTE, VIDEO, PDF).");
        }
        if (request.getTypeConseil() == TypeConseil.VIDEO
                && (request.getLienVideo() == null || request.getLienVideo().isBlank())) {
            throw new ValidationException("Un lien vidéo est requis pour un conseil de type VIDEO.");
        }
        if (request.getTypeConseil() == TypeConseil.TEXTE
                && (request.getDescription() == null || request.getDescription().isBlank())) {
            throw new ValidationException("Une description est requise pour un conseil de type TEXTE.");
        }
    }

    private void validerPdf(MultipartFile fichier) {
        String contentType = fichier.getContentType();
        if (!"application/pdf".equals(contentType)) {
            throw new ValidationException("Seuls les fichiers PDF sont acceptés.");
        }
        long maxSize = 10 * 1024 * 1024; // 10 Mo
        if (fichier.getSize() > maxSize) {
            throw new ValidationException("Le fichier PDF ne doit pas dépasser 10 Mo.");
        }
    }

    private String sauvegarderPdf(MultipartFile fichier) throws IOException {
        Path dossier = Paths.get(uploadDir);
        if (!Files.exists(dossier)) {
            Files.createDirectories(dossier);
        }

        String nomUnique = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
        Path destination = dossier.resolve(nomUnique);
        Files.copy(fichier.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        return destination.toString();
    }

    private void supprimerFichierPdf(String chemin) {
        if (chemin != null) {
            try {
                Files.deleteIfExists(Paths.get(chemin));
            } catch (IOException e) {
                // Log à ajouter selon votre système de logging
            }
        }
    }

    private ConseilPersonnaliseResponse toResponse(ConseilPersonnalise conseil) {
        String urlPdf = null;
        if (conseil.getCheminFichierPdf() != null) {
            urlPdf = baseUrl + "/api/conseils/" + conseil.getId() + "/pdf";
        }

        return ConseilPersonnaliseResponse.builder()
                .id(conseil.getId())
                .titre(conseil.getTitre())
                .description(conseil.getDescription())
                .typeConseil(conseil.getTypeConseil())
                .lienVideo(conseil.getLienVideo())
                .urlPdf(urlPdf)
                .nomFichierPdf(conseil.getNomFichierPdf())
                .dateCreation(conseil.getDateCreation())
                .patientId(conseil.getPatient().getId())
                .nomPatient(conseil.getPatient().getNom() + " " + conseil.getPatient().getPrenom())
                .build();
    }

    public String getCheminPdfById(Long id) {
        return findConseil(id).getCheminFichierPdf();
    }

}