package sn.diabete.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.diabete.patient.entity.ContenuEducatif;

@Repository
public interface ContenuEducatifRepository extends JpaRepository<ContenuEducatif, Long> {
    // On peut ajouter des méthodes personnalisées si nécessaire
}
