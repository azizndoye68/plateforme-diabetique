package sn.diabete.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.diabete.patient.entity.ConseilPersonnalise;
import sn.diabete.patient.entity.TypeConseil;

import java.util.List;

@Repository
public interface ConseilPersonnaliseRepository extends JpaRepository<ConseilPersonnalise, Long> {
    List<ConseilPersonnalise> findByPatientId(Long patientId);
    // Dans ConseilPersonnaliseRepository
    List<ConseilPersonnalise> findByPatientIdAndTypeConseil(Long patientId, TypeConseil type);
}
