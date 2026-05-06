package sn.diabete.medecin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.diabete.medecin.entity.Medecin;

import java.util.Optional;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long> {

    Optional<Medecin> findByUtilisateurId(Long utilisateurId);

    // Tu peux ajouter des méthodes personnalisées ici si nécessaire
    boolean existsByTelephone(String telephone);

    Optional<Medecin> findByNumeroProfessionnel(String numeroProfessionnel);
}
