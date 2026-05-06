package sn.diabete.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import sn.diabete.auth.entity.Utilisateur;
import sn.diabete.auth.repository.UtilisateurRepository;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final UtilisateurRepository utilisateurRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:900000}")       // 15 min par défaut (en ms)
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800000}") // 7 jours par défaut (en ms)
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // ── Access Token ──────────────────────────────────────────────
    public String generateToken(Authentication authentication) {
        String email = authentication.getName();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur non trouvé avec l'email : " + email));

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", utilisateur.getId());
        claims.put("role", utilisateur.getRole().getNom().name());
        claims.put("email", utilisateur.getEmail());

        return Jwts.builder()
                .setSubject(email)
                .addClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ── Refresh Token (opaque, UUID) ──────────────────────────────
    /**
     * Génère un refresh token opaque (UUID) stocké en base.
     * Ce n'est PAS un JWT — c'est une chaîne aléatoire unique.
     */
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    /** Durée de vie du refresh token en millisecondes */
    public long getRefreshExpirationMs() {
        return refreshExpiration;
    }

    /** Durée de vie de l'access token en secondes (pour expireEn dans la réponse) */
    public long getAccessTokenExpirationSeconds() {
        return jwtExpiration / 1000;
    }

    // ── Validation ────────────────────────────────────────────────
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            System.err.println("Token JWT invalide : " + ex.getMessage());
            return false;
        }
    }

    // ── Extraction des claims ─────────────────────────────────────
    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean isTokenExpired(String token) {
        try {
            return getClaims(token).getExpiration().before(new Date());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // Token expiré → c'est exactement ce qu'on veut détecter
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}