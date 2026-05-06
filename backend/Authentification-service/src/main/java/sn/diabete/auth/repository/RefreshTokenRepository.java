package sn.diabete.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import sn.diabete.auth.entity.RefreshToken;
import sn.diabete.auth.entity.Utilisateur;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    // Révoquer tous les refresh tokens d'un utilisateur (utile au logout)
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.utilisateur = :utilisateur")
    void revokeAllByUtilisateur(Utilisateur utilisateur);
}