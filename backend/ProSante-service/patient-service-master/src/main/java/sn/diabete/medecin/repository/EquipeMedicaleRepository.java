package sn.diabete.medecin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.diabete.medecin.entity.EquipeMedicale;

import java.util.List;

public interface EquipeMedicaleRepository extends JpaRepository<EquipeMedicale, Long> {

    List<EquipeMedicale> findByMedecinProprietaireId(Long medecinId);

    List<EquipeMedicale> findByMedecins_Id(Long medecinId);
}
