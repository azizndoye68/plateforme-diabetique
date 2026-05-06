package sn.diabete.communication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import sn.diabete.communication.entity.MessageType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageRequest {

    @NotNull(message = "L'ID de conversation est obligatoire")
    private Long conversationId;

    @NotBlank(message = "Le contenu du message est obligatoire")
    private String content;

    @NotNull(message = "L'ID de l'expéditeur est obligatoire")
    private Long senderId;

    @NotNull(message = "Le type d'expéditeur est obligatoire")
    private String senderType; // PATIENT ou MEDECIN

    private MessageType messageType = MessageType.TEXT;
}