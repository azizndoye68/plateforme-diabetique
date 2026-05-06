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

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Slf4j
public class ConversationController {

    private final ConversationService conversationService;

    /**
     * Récupérer conversations d'un patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ConversationDTO>> getPatientConversations(
            @PathVariable Long patientId
    ) {
        log.info("GET /api/conversations/patient/{}", patientId);
        List<ConversationDTO> conversations = conversationService.getPatientConversations(patientId);
        return ResponseEntity.ok(conversations);
    }

    /**
     * Récupérer conversations d'un médecin
     */
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<ConversationDTO>> getMedecinConversations(
            @PathVariable Long medecinId
    ) {
        log.info("GET /api/conversations/medecin/{}", medecinId);
        List<ConversationDTO> conversations = conversationService.getMedecinConversations(medecinId);
        return ResponseEntity.ok(conversations);
    }

    /**
     * Récupérer une conversation par ID
     */
    @GetMapping("/{conversationId}")
    public ResponseEntity<ConversationDTO> getConversationById(
            @PathVariable Long conversationId
    ) {
        log.info("GET /api/conversations/{}", conversationId);
        ConversationDTO conversation = conversationService.getConversationById(conversationId);
        return ResponseEntity.ok(conversation);
    }

    /**
     * Créer conversation PATIENT_EQUIPE (auto si pas existante)
     */
    @PostMapping("/patient/{patientId}")
    public ResponseEntity<Conversation> getOrCreatePatientConversation(
            @PathVariable Long patientId
    ) {
        log.info("POST /api/conversations/patient/{}", patientId);
        Conversation conversation = conversationService.getOrCreatePatientConversation(patientId);
        return ResponseEntity.ok(conversation);
    }

    /**
     * Créer conversation MEDECIN_MEDECIN
     */
    @PostMapping("/medecin-to-medecin")
    public ResponseEntity<Conversation> createMedecinConversation(
            @Valid @RequestBody CreateConversationRequest request
    ) {
        log.info("POST /api/conversations/medecin-to-medecin");
        Conversation conversation = conversationService.getOrCreateMedecinConversation(
                request.getRequestingMedecinId(),
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
            @PathVariable Long medecinId
    ) {
        boolean canAccess = conversationService.canMedecinAccessConversation(medecinId, conversationId);
        return ResponseEntity.ok(canAccess);
    }
}