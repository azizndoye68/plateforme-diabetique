package sn.diabete.communication.dto;

import lombok.*;
import sn.diabete.communication.entity.MessageType;
import sn.diabete.communication.entity.SenderType;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private SenderType senderType;
    private String senderName;
    private String content;
    private MessageType messageType;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private LocalDateTime createdAt;
}
