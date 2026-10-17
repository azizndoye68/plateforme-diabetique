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
import sn.diabete.communication.service.ChatActorService;
import sn.diabete.communication.security.ChatPrincipal;
import sn.diabete.communication.entity.SenderType;
import sn.diabete.communication.repository.ConversationRepository;
import sn.diabete.communication.service.ChatWebSocketService;

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
    private final ChatActorService chatActorService;
    private final ConversationRepository conversationRepository;
    private final ChatWebSocketService chatWebSocketService;

    /**
     * Récupérer messages d'une conversation (paginé)
     */
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<Page<MessageDTO>> getConversationMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            java.security.Principal principal
    ) {
        var actor = chatActorService.resolve(principal);
        if (!messageService.canAccessConversation(conversationId, actor.profileId(), actor.type()))
            return ResponseEntity.notFound().build();
        if (page < 0 || size < 1 || size > 100) return ResponseEntity.badRequest().build();
        log.info("GET /api/messages/conversation/{} - page {}", conversationId, page);
        Page<MessageDTO> messages = messageService.getConversationMessages(conversationId, page, size);
        messageService.markConversationRead(conversationId, actor.profileId(), actor.type());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markConversationRead(@PathVariable Long conversationId, java.security.Principal principal) {
        var actor = chatActorService.resolve(principal);
        if (!messageService.canAccessConversation(conversationId, actor.profileId(), actor.type()))
            return ResponseEntity.notFound().build();
        messageService.markConversationRead(conversationId, actor.profileId(), actor.type());
        return ResponseEntity.noContent().build();
    }

    /**
     * Envoyer message (REST fallback)
     */
    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(
            @Valid @RequestBody ChatMessageRequest request, java.security.Principal principal
    ) {
        var actor = chatActorService.resolve(principal);
        request.setSenderId(actor.profileId());
        request.setSenderType(actor.type().name());
        log.info("POST /api/messages - conversation {}", request.getConversationId());
        MessageDTO message = messageService.saveMessage(request);
        conversationRepository.findById(request.getConversationId()).ifPresent(c -> chatWebSocketService.publishToParticipants(c, message));
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
            @RequestParam(value = "content", defaultValue = "") String content,
            java.security.Principal principal
    ) {
        log.info("POST /api/messages/upload - conversation {}", conversationId);

        var actor = chatActorService.resolve(principal);
        if (!messageService.canAccessConversation(conversationId, actor.profileId(), actor.type()))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé à cette conversation");

        try {
            // Sauvegarder fichier
            String filename = fileStorageService.saveFile(file);
            String fileUrl = fileStorageService.getFileUrl(filename);

            // Créer message
            MessageDTO message = messageService.saveMessageWithFile(
                    conversationId,
                    actor.profileId(),
                    actor.type().name(),
                    content.isEmpty()
                            ? "Fichier joint : " + file.getOriginalFilename()
                            : content,
                    file.getOriginalFilename(),
                    fileUrl,
                    file.getSize()
            );
            conversationRepository.findById(conversationId).ifPresent(c -> chatWebSocketService.publishToParticipants(c, message));

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
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename, java.security.Principal principal) {
        try {
            if (filename.contains("/") || filename.contains("\\") || filename.contains("..")) return ResponseEntity.badRequest().build();
            var actor = chatActorService.resolve(principal);
            if (!messageService.canAccessFile(filename, actor.profileId(), actor.type())) return ResponseEntity.notFound().build();
            Path basePath = Paths.get(fileStorageConfig.getUploadDir()).toAbsolutePath().normalize();
            Path filePath = basePath.resolve(filename).normalize();
            if (!filePath.startsWith(basePath)) return ResponseEntity.badRequest().build();
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
