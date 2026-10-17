package sn.diabete.communication.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.diabete.communication.entity.Message;
import sn.diabete.communication.entity.SenderType;
import java.time.LocalDateTime;

import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Récupérer messages d'une conversation (paginé)
    Page<Message> findByConversationIdOrderByCreatedAtDesc(
            Long conversationId,
            Pageable pageable
    );

    // Dernier message d'une conversation
    Optional<Message> findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);

    Optional<Message> findFirstByFileUrl(String fileUrl);

    // Compter messages d'une conversation
    long countByConversationId(Long conversationId);

    // Compter messages non lus (à implémenter plus tard avec table statut lecture)
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversationId = :conversationId " +
            "AND m.senderId != :userId")
    long countUnreadMessages(
            @Param("conversationId") Long conversationId,
            @Param("userId") Long userId
    );

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversationId = :conversationId " +
            "AND (m.senderType <> :readerType OR m.senderId <> :readerId)")
    long countUnread(@Param("conversationId") Long conversationId,
                     @Param("readerId") Long readerId,
                     @Param("readerType") SenderType readerType);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversationId = :conversationId " +
            "AND (m.senderType <> :readerType OR m.senderId <> :readerId) " +
            "AND m.createdAt > :lastReadAt")
    long countUnreadSince(@Param("conversationId") Long conversationId,
                          @Param("readerId") Long readerId,
                          @Param("readerType") SenderType readerType,
                          @Param("lastReadAt") LocalDateTime lastReadAt);
}
