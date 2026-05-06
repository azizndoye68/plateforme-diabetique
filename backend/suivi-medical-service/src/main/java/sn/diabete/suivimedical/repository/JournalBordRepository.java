package sn.diabete.suivimedical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.diabete.suivimedical.entity.JournalBord;

import java.util.List;

public interface JournalBordRepository extends JpaRepository<JournalBord, Long> {

    List<JournalBord> findByPatientIdOrderByDateSuiviDesc(Long patientId);
}
