package sn.diabete.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.diabete.auth.dto.*;
import sn.diabete.auth.service.AuthService;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Utilisateur", description = "Gestion de l'authentification et des utilisateurs")
public class AuthController {

    private final AuthService authService;

    // ════════════════════════════════════════════════════════════════
    // 🔓 ENDPOINTS PUBLICS
    // ════════════════════════════════════════════════════════════════

    @Operation(summary = "Inscription d'un utilisateur",
            description = "Enregistre un patient, un professionnel de santé ou un admin. "
                    + "Les comptes MEDECIN sont créés avec le statut PENDING.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Utilisateur enregistré avec succès",
                    content = @Content(schema = @Schema(implementation = RegisterResponse.class))),
            @ApiResponse(responseCode = "400", description = "Nom d'utilisateur ou email déjà utilisé, ou rôle invalide"),
            @ApiResponse(responseCode = "422", description = "Données mal formatées")
    })
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "Connexion",
            description = "Authentifie l'utilisateur et retourne un access token (15 min) et un refresh token (7 jours).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Connexion réussie",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Email ou mot de passe incorrect"),
            @ApiResponse(responseCode = "403", description = "Compte non activé (PENDING ou REJECTED)")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Renouveler le token JWT",
            description = "Génère un nouvel access token à partir d'un refresh token valide. "
                    + "Le refresh token est à usage unique (rotation automatique).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Nouveau access token généré",
                    content = @Content(schema = @Schema(implementation = RefreshTokenResponse.class))),
            @ApiResponse(responseCode = "401", description = "Refresh token invalide, révoqué ou expiré")
    })
    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    // ════════════════════════════════════════════════════════════════
    // 🔐 ENDPOINTS PROTÉGÉS (utilisateur connecté)
    // ════════════════════════════════════════════════════════════════

    @Operation(summary = "Déconnexion",
            description = "Révoque l'access token courant et tous les refresh tokens de l'utilisateur. "
                    + "Les tokens révoqués sont mis en blacklist côté serveur.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Déconnexion réussie — tokens révoqués"),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(authService.logout(authorizationHeader));
    }

    @Operation(summary = "Récupération du profil utilisateur connecté",
            description = "Retourne les informations de l'utilisateur connecté.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profil récupéré",
                    content = @Content(schema = @Schema(implementation = UserProfile.class))),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @GetMapping("/profile")
    public ResponseEntity<UserProfile> getProfile() {
        return ResponseEntity.ok(authService.getProfile());
    }

    @Operation(summary = "Mise à jour du mot de passe",
            description = "Permet à l'utilisateur connecté de changer son mot de passe.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Mot de passe mis à jour avec succès"),
            @ApiResponse(responseCode = "400", description = "Ancien mot de passe incorrect"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "422", description = "Nouveau mot de passe invalide")
    })
    @PutMapping("/update-password")
    public ResponseEntity<String> updatePassword(
            @Valid @RequestBody PasswordUpdateRequest request) {
        return ResponseEntity.ok(authService.updatePassword(request));
    }

    // ════════════════════════════════════════════════════════════════
    // 🧩 ENDPOINTS INTER-SERVICES
    // ════════════════════════════════════════════════════════════════

    @Operation(summary = "Validation d'un token JWT",
            description = "Valide un token JWT et retourne les informations de l'utilisateur associé.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Résultat de la validation",
                    content = @Content(schema = @Schema(implementation = TokenValidationResponse.class)))
    })
    @GetMapping("/validate-token")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @Parameter(description = "JWT dans l'en-tête Authorization")
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(authService.validateToken(token));
    }

    @Operation(summary = "Récupérer l'email d'un utilisateur par ID",
            description = "Retourne l'email d'un utilisateur. Utilisé par les autres microservices.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Email récupéré avec succès"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @GetMapping("/users/{id}/email")
    public ResponseEntity<String> getUserEmail(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserEmailById(id));
    }

    @Operation(summary = "Récupérer plusieurs utilisateurs par IDs",
            description = "Retourne une liste d'utilisateurs correspondant aux IDs fournis.")
    @ApiResponse(responseCode = "200", description = "Liste des utilisateurs récupérée")
    @PostMapping("/users/batch")
    public ResponseEntity<List<UserDto>> getUsersByIds(@RequestBody List<Long> userIds) {
        return ResponseEntity.ok(authService.getUsersByIds(userIds));
    }

    // ════════════════════════════════════════════════════════════════
    // 🛡️ ENDPOINTS ADMIN UNIQUEMENT
    // ════════════════════════════════════════════════════════════════

    @Operation(summary = "Lister tous les utilisateurs",
            description = "Retourne la liste paginée des utilisateurs (sans mot de passe). Réservé aux ADMINISTRATEUR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste paginée récupérée"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès interdit — réservé aux administrateurs")
    })
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @PageableDefault(size = 20, sort = "username") Pageable pageable) {
        return ResponseEntity.ok(authService.getAllUsersDto(pageable));
    }

    @Operation(summary = "Rechercher un utilisateur par username")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Utilisateur trouvé",
                    content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @GetMapping("/users/search")
    public ResponseEntity<UserDto> getUserByUsername(@RequestParam String username) {
        return ResponseEntity.ok(authService.getUserByUsernameDto(username));
    }

    @Operation(summary = "Récupérer un utilisateur par ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Utilisateur trouvé",
                    content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès interdit"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @GetMapping("/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserByIdDto(id));
    }

    @Operation(summary = "Lister les professionnels en attente",
            description = "Retourne la liste paginée des professionnels dont le statut est PENDING. Réservé aux ADMINISTRATEUR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste paginée récupérée"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès interdit aux non-administrateurs")
    })
    @GetMapping("/users/pending/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getAllPendingProfessionals(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(authService.getAllPendingProfessionals(pageable));
    }

    @Operation(summary = "Approuver un professionnel de santé",
            description = "Passe le statut de PENDING à APPROVED. Réservé aux ADMINISTRATEUR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Professionnel approuvé — statut : APPROVED"),
            @ApiResponse(responseCode = "400", description = "Utilisateur non professionnel ou déjà approuvé"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès interdit — réservé aux administrateurs"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @PutMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> approveProfessional(@PathVariable Long id) {
        return ResponseEntity.ok(authService.approveProfessional(id));
    }

    @Operation(summary = "Rejeter un professionnel de santé",
            description = "Passe le statut de PENDING à REJECTED. Réservé aux ADMINISTRATEUR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Professionnel rejeté — statut : REJECTED"),
            @ApiResponse(responseCode = "400", description = "Utilisateur non professionnel ou déjà rejeté"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès interdit — réservé aux administrateurs"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @PutMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> rejectProfessional(@PathVariable Long id) {
        return ResponseEntity.ok(authService.rejectProfessional(id));
    }

    @Operation(summary = "Supprimer un utilisateur",
            description = "Supprime un compte utilisateur. Les comptes ADMINISTRATEUR ne peuvent pas être supprimés. Réservé aux ADMINISTRATEUR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Utilisateur supprimé avec succès"),
            @ApiResponse(responseCode = "400", description = "Impossible de supprimer un compte ADMINISTRATEUR"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès interdit — réservé aux administrateurs"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.ok("Utilisateur supprimé avec succès");
    }
}