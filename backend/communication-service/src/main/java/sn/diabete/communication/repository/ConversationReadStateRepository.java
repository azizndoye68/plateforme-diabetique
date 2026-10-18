package sn.diabete.communication.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.diabete.communication.entity.ConversationReadState;
import sn.diabete.communication.entity.SenderType;
import java.util.Optional;

public interface ConversationReadStateRepository extends JpaRepository<ConversationReadState, Long> {
    Optional<ConversationReadState> findByConversationIdAndReaderIdAndReaderType(
            Long conversationId, Long readerId, SenderType readerType);
}
