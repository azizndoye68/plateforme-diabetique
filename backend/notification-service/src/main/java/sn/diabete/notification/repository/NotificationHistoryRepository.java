package sn.diabete.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.diabete.notification.entity.NotificationHistory;
import sn.diabete.notification.enums.StatutNotification;
import sn.diabete.notification.enums.TypeAlerte;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationHistoryRepository extends JpaRepository<NotificationHistory, Long> {

    // ======================================================
    // PATIENT — medecinId IS NULL (notifications pour le patient)
    // ======================================================
    List<NotificationHistory> findByPatientIdAndMedecinIdIsNullOrderByDateEnvoiDesc(Long patientId);

    Long countByPatientIdAndMedecinIdIsNullAndStatut(Long patientId, StatutNotification statut);

    List<NotificationHistory> findByPatientIdAndMedecinIdIsNullAndStatut(
            Long patientId, StatutNotification statut);

    // ======================================================
    // MEDECIN — filtre par medecinId
    // ======================================================
    List<NotificationHistory> findByMedecinIdOrderByDateEnvoiDesc(Long medecinId);

    Long countByMedecinIdAndStatut(Long medecinId, StatutNotification statut);

    List<NotificationHistory> findByMedecinIdAndStatut(Long medecinId, StatutNotification statut);

    // 🆕
    List<NotificationHistory> findByMedecinIdAndPatientIdOrderByDateEnvoiDesc(
            Long medecinId, Long patientId);

    // ======================================================
    // Existants conservés
    // ======================================================
    List<NotificationHistory> findByPatientId(Long patientId);

    List<NotificationHistory> findByMedecinId(Long medecinId);

    List<NotificationHistory> findByStatut(StatutNotification statut);

    List<NotificationHistory> findByTypeAlerte(TypeAlerte typeAlerte);

    List<NotificationHistory> findByPatientIdAndDateEnvoiAfter(Long patientId, LocalDateTime date);

    Long countByPatientIdAndStatut(Long patientId, StatutNotification statut);
}