package sn.diabete.suivimedical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.diabete.suivimedical.entity.DonneePhysique;

import java.util.List;

public interface DonneePhysiqueRepository extends JpaRepository<DonneePhysique, Long> {

    List<DonneePhysique> findByPatientIdOrderByDateSuiviDesc(Long patientId);
}
