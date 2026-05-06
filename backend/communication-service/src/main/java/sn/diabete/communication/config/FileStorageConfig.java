package sn.diabete.communication.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✓ Répertoire de stockage créé : " + uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire de stockage", e);
        }
    }

    public String getUploadDir() {
        return uploadDir;
    }
}