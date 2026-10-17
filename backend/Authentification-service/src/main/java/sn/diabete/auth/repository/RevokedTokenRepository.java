package sn.diabete.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.diabete.auth.entity.RevokedToken;

import java.time.Instant;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    boolean existsByTokenHashAndExpiresAtAfter(String tokenHash, Instant now);
    void deleteByExpiresAtBefore(Instant now);
}
