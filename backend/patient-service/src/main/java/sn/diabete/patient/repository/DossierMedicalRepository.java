package sn.diabete.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.diabete.patient.entity.DossierMedical;

import java.util.Optional;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical, Long> {

    Optional<DossierMedical> findByPatientId(Long patientId);

    boolean existsByPatientId(Long patientId);
}
