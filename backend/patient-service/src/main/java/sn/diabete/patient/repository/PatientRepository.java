package sn.diabete.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.diabete.patient.entity.Patient;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUtilisateurId(Long utilisateurId);

    // Tu peux ajouter des méthodes personnalisées ici si nécessaire
    boolean existsByTelephone(String telephone);

    // 🔹 Patients rattachés à un médecin
    List<Patient> findByMedecinId(Long medecinId);

    List<Patient> findByMedecinIdIn(List<Long> medecinIds);




}
