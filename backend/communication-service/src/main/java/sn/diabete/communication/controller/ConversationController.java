package sn.diabete.communication.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.communication.dto.ConversationDTO;
import sn.diabete.communication.dto.CreateConversationRequest;
import sn.diabete.communication.entity.Conversation;
import sn.diabete.communication.service.ConversationService;
import sn.diabete.communication.service.ChatActorService;
import sn.diabete.communication.service.MessageService;
import sn.diabete.communication.security.ChatPrincipal;
import sn.diabete.communication.entity.SenderType;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Slf4j
public class ConversationController {

    private final ConversationService conversationService;
    private final ChatActorService chatActorService;
    private final MessageService messageService;

    /**
     * Récupérer conversations d'un patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ConversationDTO>> getPatientConversations(
            @PathVariable Long patientId, java.security.Principal principal
    ) {
        var actor = chatActorService.resolve(principal);
        if (actor.type() != SenderType.PATIENT)
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        Long authenticatedPatientId = actor.profileId();
        log.info("GET /api/conversations/patient/{}", authenticatedPatientId);
        List<ConversationDTO> conversations = conversationService.getPatientConversations(authenticatedPatientId);
        conversations.forEach(c -> c.setUnreadCount((int) messageService.getUnreadCount(c.getId(), actor.profileId(), actor.type())));
        return ResponseEntity.ok(conversations);
    }

    /**
     * Récupérer conversations d'un médecin
     */
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<ConversationDTO>> getMedecinConversations(
            @PathVariable Long medecinId, java.security.Principal principal
    ) {
        var actor = chatActorService.resolve(principal);
        if (actor.type() != SenderType.MEDECIN || !actor.profileId().equals(medecinId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        log.info("GET /api/conversations/medecin/{}", medecinId);
        List<ConversationDTO> conversations = conversationService.getMedecinConversations(medecinId);
        conversations.forEach(c -> c.setUnreadCount((int) messageService.getUnreadCount(c.getId(), actor.profileId(), actor.type())));
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/medecin/{medecinId}/unread-count")
    public ResponseEntity<Long> getMedecinUnreadCount(@PathVariable Long medecinId, java.security.Principal principal) {
        var actor = chatActorService.resolve(principal);
        if (actor.type() != SenderType.MEDECIN || !actor.profileId().equals(medecinId))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        long count = conversationService.getMedecinConversations(medecinId).stream()
                .mapToLong(c -> messageService.getUnreadCount(c.getId(), actor.profileId(), actor.type())).sum();
        return ResponseEntity.ok(count);
    }

    /**
     * Récupérer une conversation par ID
     */
    @GetMapping("/{conversationId}")
    public ResponseEntity<ConversationDTO> getConversationById(
            @PathVariable Long conversationId, java.security.Principal principal
    ) {
        var actor = chatActorService.resolve(principal);
        if (!messageService.canAccessConversation(conversationId, actor.profileId(), actor.type()))
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        log.info("GET /api/conversations/{}", conversationId);
        ConversationDTO conversation = conversationService.getConversationById(conversationId);
        return ResponseEntity.ok(conversation);
    }

    /**
     * Créer conversation PATIENT_EQUIPE (auto si pas existante)
     */
    @PostMapping("/patient/{patientId}")
    public ResponseEntity<Conversation> getOrCreatePatientConversation(
            @PathVariable Long patientId, java.security.Principal principal
    ) {
        var actor = chatActorService.resolve(principal);
        Conversation conversation;
        if (actor.type() == SenderType.PATIENT) {
            conversation = conversationService.getOrCreatePatientConversation(actor.profileId());
        } else if (actor.type() == SenderType.MEDECIN) {
            conversation = conversationService.getOrCreatePatientConversationForMedecin(patientId, actor.profileId());
        } else {
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        }
        log.info("POST /api/conversations/patient/{} par {}", conversation.getPatientId(), actor.type());
        return ResponseEntity.ok(conversation);
    }

    /**
     * Créer conversation MEDECIN_MEDECIN
     */
    @PostMapping("/medecin-to-medecin")
    public ResponseEntity<Conversation> createMedecinConversation(
            @Valid @RequestBody CreateConversationRequest request, java.security.Principal principal
    ) {
        var actor = chatActorService.resolve(principal);
        if (actor.type() != SenderType.MEDECIN)
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        log.info("POST /api/conversations/medecin-to-medecin");
        Conversation conversation = conversationService.getOrCreateMedecinConversation(
                actor.profileId(),
                request.getTargetMedecinId()
        );
        return ResponseEntity.ok(conversation);
    }

    /**
     * Vérifier accès médecin à conversation
     */
    @GetMapping("/{conversationId}/can-access/{medecinId}")
    public ResponseEntity<Boolean> canMedecinAccess(
            @PathVariable Long conversationId,
            @PathVariable Long medecinId, java.security.Principal principal
    ) {
        var actor = chatActorService.resolve(principal);
        boolean canAccess = actor.type() == SenderType.MEDECIN && actor.profileId().equals(medecinId)
                && conversationService.canMedecinAccessConversation(actor.profileId(), conversationId);
        return ResponseEntity.ok(canAccess);
    }
}
