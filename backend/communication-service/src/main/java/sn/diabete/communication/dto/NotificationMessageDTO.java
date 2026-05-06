// ============================================================
// NotificationMessageDTO.java (pour RabbitMQ)
// ============================================================
package sn.diabete.communication.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationMessageDTO {
    private String type; // NEW_MESSAGE
    private List<Long> recipientIds;
    private String recipientType; // PATIENT, MEDECIN
    private String senderName;
    private String messagePreview;
    private Long conversationId;
    private LocalDateTime timestamp;
}