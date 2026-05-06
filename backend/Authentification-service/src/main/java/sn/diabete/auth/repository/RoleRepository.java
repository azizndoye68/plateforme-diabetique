package sn.diabete.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.diabete.auth.entity.Role;
import sn.diabete.auth.entity.TypeRole;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Rechercher un rôle par son nom (TypeRole)
     * Exemple : PATIENT, MEDECIN, ADMIN
     */
    Optional<Role> findByNom(TypeRole nom);

    /**
     * Vérifier l'existence d'un rôle
     */
    boolean existsByNom(TypeRole nom);
}
