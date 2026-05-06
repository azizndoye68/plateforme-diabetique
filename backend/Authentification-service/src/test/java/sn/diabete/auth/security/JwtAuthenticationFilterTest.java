package sn.diabete.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import sn.diabete.auth.entity.Role;
import sn.diabete.auth.entity.StatutCompte;
import sn.diabete.auth.entity.TypeRole;
import sn.diabete.auth.entity.Utilisateur;
import sn.diabete.auth.repository.RoleRepository;
import sn.diabete.auth.repository.UtilisateurRepository;
import sn.diabete.auth.repository.RefreshTokenRepository;
import sn.diabete.auth.service.EmailService;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/*
 * Tests d'INTÉGRATION du filtre JWT.
 * On démarre le contexte Spring complet avec @SpringBootTest.
 * La BDD est remplacée par H2 (application-test.properties).
 * Les services externes (email, eureka) sont mockés.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("JwtAuthenticationFilter — tests d'intégration")
class JwtAuthenticationFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private TokenBlacklist tokenBlacklist;

    // ── Mocks des dépendances externes ────────────────────────────
    @MockBean
    private EmailService emailService;

    // ── Repositories réels (H2 en mémoire) ───────────────────────
    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    // ── Fixtures ──────────────────────────────────────────────────
    private static final String EMAIL_MEDECIN = "filtre.medecin@test.sn";
    private static final String EMAIL_ADMIN   = "filtre.admin@test.sn";
    private static final String PASSWORD      = "hashed-password";

    private String tokenMedecin;
    private String tokenAdmin;

    @BeforeEach
    void setUp() {
        // Nettoyer entre chaque test
        refreshTokenRepository.deleteAll();
        utilisateurRepository.deleteAll();
        tokenBlacklist.clear(); // ← on va ajouter cette méthode

        // Créer le rôle MEDECIN s'il n'existe pas
        Role roleMedecin = roleRepository.findByNom(TypeRole.MEDECIN)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setNom(TypeRole.MEDECIN);
                    return roleRepository.save(r);
                });

        // Créer le rôle ADMIN s'il n'existe pas
        Role roleAdmin = roleRepository.findByNom(TypeRole.ADMIN)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setNom(TypeRole.ADMIN);
                    return roleRepository.save(r);
                });

        // Créer un médecin en base H2
        Utilisateur medecin = new Utilisateur();
        medecin.setEmail(EMAIL_MEDECIN);
        medecin.setUsername("filtre.medecin");
        medecin.setPassword(PASSWORD);
        medecin.setRole(roleMedecin);
        medecin.setStatut(StatutCompte.APPROVED);
        medecin.setEnabled(true);
        utilisateurRepository.save(medecin);

        // Créer un admin en base H2
        Utilisateur admin = new Utilisateur();
        admin.setEmail(EMAIL_ADMIN);
        admin.setUsername("filtre.admin");
        admin.setPassword(PASSWORD);
        admin.setRole(roleAdmin);
        admin.setStatut(StatutCompte.APPROVED);
        admin.setEnabled(true);
        utilisateurRepository.save(admin);

        // Générer les tokens
        var authMedecin = new org.springframework.security.authentication
                .UsernamePasswordAuthenticationToken(EMAIL_MEDECIN, null);
        tokenMedecin = jwtTokenProvider.generateToken(authMedecin);

        var authAdmin = new org.springframework.security.authentication
                .UsernamePasswordAuthenticationToken(EMAIL_ADMIN, null);
        tokenAdmin = jwtTokenProvider.generateToken(authAdmin);
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 1 — Requêtes sans token
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Sans token Authorization")
    class SansToken {

        @Test
        @DisplayName("GET /profile sans token → 401")
        void sansToken_retourne401() throws Exception {
            mockMvc.perform(get("/api/auth/profile"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /users sans token → 401")
        void sansToken_users_retourne401() throws Exception {
            mockMvc.perform(get("/api/auth/users"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 2 — Token valide
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Avec token valide")
    class AvecTokenValide {

        @Test
        @DisplayName("GET /profile avec token valide → 200")
        void avecTokenValide_profile_retourne200() throws Exception {
            mockMvc.perform(get("/api/auth/profile")
                            .header("Authorization", "Bearer " + tokenMedecin))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("GET /users avec token ADMIN → 200")
        void avecTokenAdmin_users_retourne200() throws Exception {
            mockMvc.perform(get("/api/auth/users")
                            .header("Authorization", "Bearer " + tokenAdmin))
                    .andExpect(status().isOk());
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 3 — Token blacklisté (après logout)
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Token blacklisté (logout)")
    class TokenBlackiste {

        @Test
        @DisplayName("token révoqué → 401")
        void tokenRévoqué_retourne401() throws Exception {
            // Simuler un logout → blacklister le token
            tokenBlacklist.blacklist(tokenMedecin);

            mockMvc.perform(get("/api/auth/profile")
                            .header("Authorization", "Bearer " + tokenMedecin))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("token différent non révoqué → toujours valide")
        void autreToken_nonRévoqué_retourneOk() throws Exception {
            // Blacklister seulement le token médecin
            tokenBlacklist.blacklist(tokenMedecin);

            // Le token admin n'est pas blacklisté → doit passer
            mockMvc.perform(get("/api/auth/profile")
                            .header("Authorization", "Bearer " + tokenAdmin))
                    .andExpect(status().isOk());
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 4 — Token malformé
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Token malformé ou invalide")
    class TokenMalforme {

        @Test
        @DisplayName("token aléatoire → 401")
        void tokenAleatoire_retourne401() throws Exception {
            mockMvc.perform(get("/api/auth/profile")
                            .header("Authorization", "Bearer token.bidon.invalide"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("header Authorization sans 'Bearer ' → 401")
        void sansPrefixBearer_retourne401() throws Exception {
            mockMvc.perform(get("/api/auth/profile")
                            .header("Authorization", tokenMedecin))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("token avec signature falsifiée → 401")
        void tokenFalsifie_retourne401() throws Exception {
            String[] parties = tokenMedecin.split("\\.");
            String tokenFalsifie = parties[0] + "." + parties[1]
                    + ".SIGNATURE_COMPLETEMENT_FAUSSE";

            mockMvc.perform(get("/api/auth/profile")
                            .header("Authorization", "Bearer " + tokenFalsifie))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GROUPE 5 — Accès ADMIN vs MEDECIN
    // ══════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Contrôle des rôles")
    class ControleRoles {

        @Test
        @DisplayName("MEDECIN accède à /users → 403")
        void medecin_accederUsers_retourne403() throws Exception {
            mockMvc.perform(get("/api/auth/users")
                            .header("Authorization", "Bearer " + tokenMedecin))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("ADMIN accède à /users/pending/all → 200")
        void admin_accederPending_retourne200() throws Exception {
            mockMvc.perform(get("/api/auth/users/pending/all")
                            .header("Authorization", "Bearer " + tokenAdmin))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("MEDECIN accède à /users/pending/all → 403")
        void medecin_accederPending_retourne403() throws Exception {
            mockMvc.perform(get("/api/auth/users/pending/all")
                            .header("Authorization", "Bearer " + tokenMedecin))
                    .andExpect(status().isForbidden());
        }
    }
}