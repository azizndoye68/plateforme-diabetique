package sn.diabete.communication.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.diabete.communication.entity.Conversation;
import sn.diabete.communication.entity.ConversationStatus;
import sn.diabete.communication.entity.ConversationType;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // ✅ List au lieu de Optional pour gérer les doublons existants
    List<Conversation> findByPatientIdAndType(Long patientId, ConversationType type);

    List<Conversation> findByPatientIdAndStatus(Long patientId, ConversationStatus status);

    List<Conversation> findByMedecinReferentIdAndTypeAndStatus(
            Long medecinReferentId,
            ConversationType type,
            ConversationStatus status
    );

    @Query("SELECT c FROM Conversation c WHERE c.type = :type " +
            "AND ((c.medecinId1 = :medecinId1 AND c.medecinId2 = :medecinId2) " +
            "OR (c.medecinId1 = :medecinId2 AND c.medecinId2 = :medecinId1))")
    Optional<Conversation> findConversationBetweenMedecins(
            @Param("medecinId1") Long medecinId1,
            @Param("medecinId2") Long medecinId2,
            @Param("type") ConversationType type
    );

    @Query("SELECT c FROM Conversation c WHERE c.type = :type " +
            "AND c.status = :status " +
            "AND (c.medecinId1 = :medecinId OR c.medecinId2 = :medecinId) " +
            "ORDER BY c.lastMessageAt DESC")
    List<Conversation> findMedecinConversations(
            @Param("medecinId") Long medecinId,
            @Param("type") ConversationType type,
            @Param("status") ConversationStatus status
    );
}