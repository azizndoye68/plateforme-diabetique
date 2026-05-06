package sn.diabete.suivimedical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.diabete.suivimedical.entity.Glycemie;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GlycemieRepository extends JpaRepository<Glycemie, Long> {

    List<Glycemie> findByPatientId(Long patientId);

    List<Glycemie> findByDateSuivi(LocalDateTime dateSuivi);

    Optional<Glycemie> findTopByPatientIdOrderByDateSuiviDesc(Long patientId);

    List<Glycemie> findTop30ByPatientIdOrderByDateSuiviDesc(Long patientId);

    // 🆕 Requêtes pour les analyses avancées
    @Query("SELECT DISTINCT g.patientId FROM Glycemie g WHERE g.dateSuivi < :dateLimit")
    List<Long> findPatientIdsWithNoMeasurementSince(@Param("dateLimit") LocalDateTime dateLimit);

    @Query("SELECT COUNT(g) FROM Glycemie g WHERE g.patientId = :patientId " +
            "AND g.niveauAlerte = sn.diabete.suivimedical.enums.NiveauAlerte.CRITIQUE " +
            "AND g.dateSuivi > :since")
    Long countCriticalMeasurementsForPatient(
            @Param("patientId") Long patientId,
            @Param("since") LocalDateTime since
    );

    List<Glycemie> findByPatientIdAndDateSuiviAfter(Long patientId, LocalDateTime date);
}