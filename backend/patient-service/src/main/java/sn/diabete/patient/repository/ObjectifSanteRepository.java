package sn.diabete.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.diabete.patient.entity.ObjectifSante;
import java.util.List;

@Repository
public interface ObjectifSanteRepository extends JpaRepository<ObjectifSante, Long> {
    List<ObjectifSante> findByPatientId(Long patientId);
}
