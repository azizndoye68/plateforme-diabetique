package sn.diabete.communication.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sn.diabete.communication.config.FileStorageConfig;
import sn.diabete.communication.dto.ChatMessageRequest;
import sn.diabete.communication.dto.MessageDTO;
import sn.diabete.communication.service.FileStorageService;
import sn.diabete.communication.service.MessageService;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;
    private final FileStorageService fileStorageService;
    private final FileStorageConfig fileStorageConfig;

    /**
     * Récupérer messages d'une conversation (paginé)
     */
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<Page<MessageDTO>> getConversationMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        log.info("GET /api/messages/conversation/{} - page {}", conversationId, page);
        Page<MessageDTO> messages = messageService.getConversationMessages(conversationId, page, size);
        return ResponseEntity.ok(messages);
    }

    /**
     * Envoyer message (REST fallback)
     */
    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(
            @Valid @RequestBody ChatMessageRequest request
    ) {
        log.info("POST /api/messages - conversation {}", request.getConversationId());
        MessageDTO message = messageService.saveMessage(request);
        return ResponseEntity.ok(message);
    }
    /**
     * Upload fichier avec message
     */
    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<MessageDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("conversationId") Long conversationId,
            @RequestParam("senderId") Long senderId,
            @RequestParam("senderType") String senderType,
            @RequestParam(value = "content", defaultValue = "") String content
    ) {
        log.info("POST /api/messages/upload - conversation {}", conversationId);

        try {
            // Sauvegarder fichier
            String filename = fileStorageService.saveFile(file);
            String fileUrl = fileStorageService.getFileUrl(filename);

            // Créer message
            MessageDTO message = messageService.saveMessageWithFile(
                    conversationId,
                    senderId,
                    senderType,
                    content.isEmpty()
                            ? "Fichier joint : " + file.getOriginalFilename()
                            : content,
                    file.getOriginalFilename(),
                    fileUrl,
                    file.getSize()
            );

            return ResponseEntity.ok(message);

        } catch (Exception e) {
            log.error("Erreur upload fichier", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Télécharger fichier
     */
    @GetMapping("/files/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(fileStorageConfig.getUploadDir()).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            log.error("Erreur téléchargement fichier", e);
            return ResponseEntity.badRequest().build();
        }
    }
}