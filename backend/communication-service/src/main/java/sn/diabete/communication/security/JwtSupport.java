package sn.diabete.communication.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class JwtSupport {
    private static final Logger log = LoggerFactory.getLogger(JwtSupport.class);
    @Value("${jwt.secret}") private String secret;

    @PostConstruct
    void logVerificationKeyFingerprint() {
        log.info("JWT verification key fingerprint (SHA-256 prefix): {}", fingerprint(secret));
    }

    public ChatPrincipal authenticate(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
        Number userId = claims.get("userId", Number.class);
        String role = claims.get("role", String.class);
        if (userId == null || role == null) throw new IllegalArgumentException("JWT incomplet");
        return new ChatPrincipal(userId.longValue(), role);
    }

    private SecretKey key() { return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }

    private String fingerprint(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest).substring(0, 12);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponible", ex);
        }
    }
}
