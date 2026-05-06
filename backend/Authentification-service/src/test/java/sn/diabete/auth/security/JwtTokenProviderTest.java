package sn.diabete.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
import sn.diabete.auth.entity.Role;
import sn.diabete.auth.entity.StatutCompte;
import sn.diabete.auth.entity.TypeRole;
import sn.diabete.auth.entity.Utilisateur;
import sn.diabete.auth.repository.UtilisateurRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/*
 * Tests UNITAIRES purs — pas de contexte Spring.
 * On injecte les @Value manuellement avec ReflectionTestUtils.
 * Mockito simule UtilisateurRepository → pas de BDD nécessaire.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("JwtTokenProvider — tests unitaires")
class JwtTokenProviderTest {

    // ── Dépendances mockées ────────────────────────────────────────
    @Mock
    private UtilisateurRepository utilisateurRepository;

    // ── Classe testée ──────────────────────────────────────────────
    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    // ── Constantes de test ─────────────────────────────────────────
    private static final String SECRET =
            "MySuperSecretKeyForJwtTokenMySuperSecretKeyForJwtToken" +
                    "MySuperSecretKeyForJwtToken1234";
    private static final long EXPIRATION     = 900_000L;   // 15 min
    private static final long REFRESH_EXPIRY = 604_800_000L; // 7 jours

    private static final String EMAIL_MEDECIN = "moussa@test.sn";
    private static final Long   ID_MEDECIN    = 1L;

    // ── Fixtures ───────────────────────────────────────────────────
    private Utilisateur utilisateurMedecin;
    private Authentication authMedecin;

    @BeforeEach
    void setUp() {
        // 1. Injecter les @Value (pas de contexte Spring ici)
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret",     SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", EXPIRATION);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpiration", REFRESH_EXPIRY);

        // 2. Construire un utilisateur de test
        Role role = new Role();
        role.setNom(TypeRole.MEDECIN);

        utilisateurMedecin = new Utilisateur();
        utilisateurMedecin.setId(ID_MEDECIN);
        utilisateurMedecin.setEmail(EMAIL_MEDECIN);
        utilisateurMedecin.setUsername("moussa.diallo");
        utilisateurMedecin.setPassword("hashed-password");
        utilisateurMedecin.setRole(role);
        utilisateurMedecin.setStatut(StatutCompte.APPROVED);
        utilisateurMedecin.setEnabled(true);

        // 3. Objet Authentication Spring
        authMedecin = new UsernamePasswordAuthenticationToken(
                EMAIL_MEDECIN, null
        );
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 1 — Génération du token
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("generateToken()")
    class GenerateToken {

        @Test
        @DisplayName("doit retourner un JWT avec 3 parties séparées par des points")
        void doitRetournerJwtBienStructure() {
            when(utilisateurRepository.findByEmail(EMAIL_MEDECIN))
                    .thenReturn(Optional.of(utilisateurMedecin));

            String token = jwtTokenProvider.generateToken(authMedecin);

            // Un JWT = header.payload.signature
            assertThat(token).isNotBlank();
            assertThat(token.split("\\.")).hasSize(3);
        }

        @Test
        @DisplayName("deux appels successifs produisent des tokens différents")
        void deuxAppelsProduisentTokensDifferents() throws InterruptedException {
            when(utilisateurRepository.findByEmail(EMAIL_MEDECIN))
                    .thenReturn(Optional.of(utilisateurMedecin));

            String token1 = jwtTokenProvider.generateToken(authMedecin);

            Thread.sleep(1001); // attendre que le timestamp (iat) change

            String token2 = jwtTokenProvider.generateToken(authMedecin);

            assertThat(token1).isNotEqualTo(token2);
        }

        @Test
        @DisplayName("lève une exception si l'utilisateur est introuvable")
        void leveExceptionSiUtilisateurAbsent() {
            when(utilisateurRepository.findByEmail(EMAIL_MEDECIN))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> jwtTokenProvider.generateToken(authMedecin))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining(EMAIL_MEDECIN);
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 2 — Extraction des claims
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Extraction des claims")
    class ExtractionClaims {

        private String token;

        @BeforeEach
        void genererToken() {
            when(utilisateurRepository.findByEmail(EMAIL_MEDECIN))
                    .thenReturn(Optional.of(utilisateurMedecin));
            token = jwtTokenProvider.generateToken(authMedecin);
        }

        @Test
        @DisplayName("getEmailFromToken() — doit extraire l'email exact")
        void doitExtraireEmail() {
            assertThat(jwtTokenProvider.getEmailFromToken(token))
                    .isEqualTo(EMAIL_MEDECIN);
        }

        @Test
        @DisplayName("getUserIdFromToken() — doit extraire l'ID exact")
        void doitExtraireUserId() {
            assertThat(jwtTokenProvider.getUserIdFromToken(token))
                    .isEqualTo(ID_MEDECIN);
        }

        @Test
        @DisplayName("getRoleFromToken() — doit extraire le rôle MEDECIN")
        void doitExtraireRole() {
            assertThat(jwtTokenProvider.getRoleFromToken(token))
                    .isEqualTo("MEDECIN");
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 3 — Validation du token
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("validateToken()")
    class ValidateToken {

        @Test
        @DisplayName("token valide fraîchement généré → true")
        void tokenValide_retourneTrue() {
            when(utilisateurRepository.findByEmail(EMAIL_MEDECIN))
                    .thenReturn(Optional.of(utilisateurMedecin));

            String token = jwtTokenProvider.generateToken(authMedecin);

            assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("token avec signature falsifiée → false")
        void tokenFalsifie_retourneFalse() {
            when(utilisateurRepository.findByEmail(EMAIL_MEDECIN))
                    .thenReturn(Optional.of(utilisateurMedecin));

            String token = jwtTokenProvider.generateToken(authMedecin);

            // Remplacer toute la 3ème partie (signature) par une fausse
            String[] parties = token.split("\\.");
            String tokenFalsifie = parties[0] + "." + parties[1] + ".SIGNATURE_COMPLETEMENT_FAUSSE";

            assertThat(jwtTokenProvider.validateToken(tokenFalsifie)).isFalse();
        }

        @Test
        @DisplayName("chaîne aléatoire → false")
        void chaineAleatoire_retourneFalse() {
            assertThat(jwtTokenProvider.validateToken("pas.un.jwt")).isFalse();
        }

        @Test
        @DisplayName("token vide → false")
        void tokenVide_retourneFalse() {
            assertThat(jwtTokenProvider.validateToken("")).isFalse();
        }

        @Test
        @DisplayName("token expiré → false")
        void tokenExpire_retourneFalse() throws Exception {
            // Mettre expiration à 1 ms pour forcer l'expiration
            ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 1L);

            when(utilisateurRepository.findByEmail(EMAIL_MEDECIN))
                    .thenReturn(Optional.of(utilisateurMedecin));

            String tokenCourt = jwtTokenProvider.generateToken(authMedecin);

            // Attendre que le token expire
            Thread.sleep(10);

            assertThat(jwtTokenProvider.validateToken(tokenCourt)).isFalse();

            // Remettre l'expiration normale
            ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", EXPIRATION);
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 4 — isTokenExpired
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("isTokenExpired()")
    class IsTokenExpired {

        @Test
        @DisplayName("token frais → false (pas encore expiré)")
        void tokenFrais_retourneFalse() {
            when(utilisateurRepository.findByEmail(EMAIL_MEDECIN))
                    .thenReturn(Optional.of(utilisateurMedecin));

            String token = jwtTokenProvider.generateToken(authMedecin);

            assertThat(jwtTokenProvider.isTokenExpired(token)).isFalse();
        }

        @Test
        @DisplayName("token avec expiration dépassée → true")
        void tokenExpire_retourneTrue() throws Exception {
            ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 1L);

            when(utilisateurRepository.findByEmail(EMAIL_MEDECIN))
                    .thenReturn(Optional.of(utilisateurMedecin));

            String tokenCourt = jwtTokenProvider.generateToken(authMedecin);
            Thread.sleep(10);

            assertThat(jwtTokenProvider.isTokenExpired(tokenCourt)).isTrue();

            ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", EXPIRATION);
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 5 — Refresh token
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("generateRefreshToken()")
    class GenerateRefreshToken {

        @Test
        @DisplayName("doit retourner une chaîne non vide")
        void doitRetournerChaineNonVide() {
            assertThat(jwtTokenProvider.generateRefreshToken()).isNotBlank();
        }

        @Test
        @DisplayName("deux appels retournent des valeurs différentes (UUID unique)")
        void doitEtreUnique() {
            String r1 = jwtTokenProvider.generateRefreshToken();
            String r2 = jwtTokenProvider.generateRefreshToken();

            assertThat(r1).isNotEqualTo(r2);
        }

        @Test
        @DisplayName("getRefreshExpirationMs() retourne la valeur configurée")
        void doitRetournerExpirationConfiguree() {
            assertThat(jwtTokenProvider.getRefreshExpirationMs())
                    .isEqualTo(REFRESH_EXPIRY);
        }

        @Test
        @DisplayName("getAccessTokenExpirationSeconds() retourne 900 secondes")
        void doitRetourner900Secondes() {
            assertThat(jwtTokenProvider.getAccessTokenExpirationSeconds())
                    .isEqualTo(900L);
        }
    }
}