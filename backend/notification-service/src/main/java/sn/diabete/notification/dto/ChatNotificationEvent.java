package sn.diabete.notification.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class ChatNotificationEvent {
    private String type;
    private List<Long> recipientIds;
    private String recipientType;
    private String senderName;
    private String messagePreview;
    private Long conversationId;
    private LocalDateTime timestamp;
}
