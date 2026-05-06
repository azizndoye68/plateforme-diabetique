package sn.diabete.medecin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.diabete.medecin.entity.RendezVous;
import sn.diabete.medecin.entity.StatutRendezVous;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    List<RendezVous> findByPatientId(Long patientId);

    List<RendezVous> findByMedecinId(Long medecinId);

    // 🆕 Rappel J-1 : RDV demain entre 00h00 et 23h59
    @Query("SELECT r FROM RendezVous r WHERE r.dateRdv BETWEEN :debutDemain AND :finDemain " +
            "AND r.statut IN :statuts")
    List<RendezVous> findRendezVousDemain(
            @Param("debutDemain") LocalDateTime debutDemain,
            @Param("finDemain") LocalDateTime finDemain,
            @Param("statuts") List<StatutRendezVous> statuts
    );

    // 🆕 Rappel H-2 : RDV dans exactement 2h (fenêtre de 10 min)
    @Query("SELECT r FROM RendezVous r WHERE r.dateRdv BETWEEN :debut AND :fin " +
            "AND r.statut IN :statuts")
    List<RendezVous> findRendezVousDansDeuxHeures(
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin,
            @Param("statuts") List<StatutRendezVous> statuts
    );
}