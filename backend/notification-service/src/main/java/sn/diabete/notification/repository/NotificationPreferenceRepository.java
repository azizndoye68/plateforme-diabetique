package sn.diabete.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.diabete.notification.entity.NotificationPreference;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    Optional<NotificationPreference> findByPatientId(Long patientId);

    List<NotificationPreference> findByMedecinId(Long medecinId);

    @Query("SELECT np FROM NotificationPreference np WHERE " +
            "(np.rappelMatin IS NOT NULL AND (" +
            "   (:startTime <= :endTime AND np.rappelMatin BETWEEN :startTime AND :endTime) OR " +
            "   (:startTime > :endTime AND (np.rappelMatin >= :startTime OR np.rappelMatin <= :endTime))" +
            ")) OR " +
            "(np.rappelMidi IS NOT NULL AND (" +
            "   (:startTime <= :endTime AND np.rappelMidi BETWEEN :startTime AND :endTime) OR " +
            "   (:startTime > :endTime AND (np.rappelMidi >= :startTime OR np.rappelMidi <= :endTime))" +
            ")) OR " +
            "(np.rappelSoir IS NOT NULL AND (" +
            "   (:startTime <= :endTime AND np.rappelSoir BETWEEN :startTime AND :endTime) OR " +
            "   (:startTime > :endTime AND (np.rappelSoir >= :startTime OR np.rappelSoir <= :endTime))" +
            "))")
    List<NotificationPreference> findPatientsWithReminderBetween(
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    List<NotificationPreference> findAll();
}
