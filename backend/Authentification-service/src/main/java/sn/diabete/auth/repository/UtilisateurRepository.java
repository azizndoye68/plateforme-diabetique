package sn.diabete.auth.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.diabete.auth.entity.Role;
import sn.diabete.auth.entity.StatutCompte;
import sn.diabete.auth.entity.Utilisateur;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByUsername(String username);

    Optional<Utilisateur> findByEmail(String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    // Liste paginée de professionnels en attente
    Page<Utilisateur> findByStatutAndRoleIn(StatutCompte statut, List<Role> roles, Pageable pageable);
    // Variante non paginée
    List<Utilisateur> findByStatutAndRoleIn(StatutCompte statut, List<Role> roles);
}
