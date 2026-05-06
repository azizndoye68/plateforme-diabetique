package sn.diabete.communication.dto;

import lombok.*;
import sn.diabete.communication.entity.ConversationStatus;
import sn.diabete.communication.entity.ConversationType;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDTO {
    private Long id;
    private ConversationType type;
    private ConversationStatus status;

    // Informations patient (si PATIENT_EQUIPE)
    private Long patientId;
    private String patientName;

    // Informations médecins
    private Long medecinReferentId;
    private String medecinReferentName;
    private List<ParticipantDTO> participants;

    // Pour conversation MEDECIN_MEDECIN
    private Long otherMedecinId;
    private String otherMedecinName;

    // Dernier message
    private MessageDTO lastMessage;
    private LocalDateTime lastMessageAt;
    private int unreadCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
