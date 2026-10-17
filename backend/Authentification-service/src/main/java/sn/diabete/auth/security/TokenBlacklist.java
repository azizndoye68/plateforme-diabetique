package sn.diabete.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import sn.diabete.auth.entity.RevokedToken;
import sn.diabete.auth.repository.RevokedTokenRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

/** Persists only token hashes so revocations survive restarts and multiple instances. */
@Component
@RequiredArgsConstructor
public class TokenBlacklist {

    private final RevokedTokenRepository revokedTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void blacklist(String token) {
        Instant now = Instant.now();
        revokedTokenRepository.deleteByExpiresAtBefore(now);
        Instant expiresAt = jwtTokenProvider.getTokenExpiration(token);
        if (expiresAt.isAfter(now)) {
            RevokedToken revokedToken = new RevokedToken();
            revokedToken.setTokenHash(sha256(token));
            revokedToken.setExpiresAt(expiresAt);
            revokedTokenRepository.save(revokedToken);
        }
    }

    public boolean isBlacklisted(String token) {
        return revokedTokenRepository.existsByTokenHashAndExpiresAtAfter(sha256(token), Instant.now());
    }

    /** Retained for integration-test fixture cleanup. */
    @Transactional
    public void clear() {
        revokedTokenRepository.deleteAll();
    }

    public static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 indisponible", impossible);
        }
    }
}
