package sn.diabete.communication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sn.diabete.communication.config.FileStorageConfig;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final FileStorageConfig fileStorageConfig;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_EXTENSIONS = {
            "pdf", "jpg", "jpeg", "png", "doc", "docx"
    };

    /**
     * Sauvegarder un fichier
     */
    public String saveFile(MultipartFile file) {
        validateFile(file);

        try {
            // Générer nom unique
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String newFilename = UUID.randomUUID().toString() + "." + extension;

            // Chemin de sauvegarde
            Path uploadPath = Paths.get(fileStorageConfig.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(newFilename).normalize();
            if (!filePath.startsWith(uploadPath)) throw new IllegalArgumentException("Chemin de fichier invalide");

            // Sauvegarder
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Fichier sauvegardé : {}", newFilename);
            return newFilename;

        } catch (IOException e) {
            log.error("Erreur sauvegarde fichier", e);
            throw new RuntimeException("Impossible de sauvegarder le fichier", e);
        }
    }

    /**
     * Valider le fichier
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Fichier vide");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Fichier trop volumineux (max 10MB)");
        }

        String extension = getFileExtension(file.getOriginalFilename());
        boolean isAllowed = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equalsIgnoreCase(extension)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new RuntimeException("Type de fichier non autorisé");
        }

        String contentType = file.getContentType();
        if (contentType != null && !(contentType.equals("application/pdf")
                || contentType.startsWith("image/")
                || contentType.equals("application/msword")
                || contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                || contentType.equals("application/octet-stream"))) {
            throw new RuntimeException("Type de contenu non autorisé");
        }
    }

    /**
     * Récupérer extension fichier
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    /**
     * Construire URL d'accès au fichier
     */
    public String getFileUrl(String filename) {
        return "/api/messages/files/" + filename;
    }
}
