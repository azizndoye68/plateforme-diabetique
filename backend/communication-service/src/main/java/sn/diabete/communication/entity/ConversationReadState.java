package sn.diabete.communication.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_read_states", uniqueConstraints = @UniqueConstraint(
        name = "uk_conversation_reader", columnNames = {"conversation_id", "reader_id", "reader_type"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationReadState {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;
    @Column(name = "reader_id", nullable = false)
    private Long readerId;
    @Enumerated(EnumType.STRING)
    @Column(name = "reader_type", nullable = false)
    private SenderType readerType;
    @Column(name = "last_read_at", nullable = false)
    private LocalDateTime lastReadAt;
}
