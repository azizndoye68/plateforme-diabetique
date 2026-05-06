package sn.diabete.medecin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.diabete.medecin.entity.Consultation;

import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByMedecinId(Long medecinId);
    List<Consultation> findByPatientId(Long patientId);
}
