package sn.diabete.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.diabete.auth.dto.*;
import sn.diabete.auth.entity.*;
import sn.diabete.auth.exception.*;
import sn.diabete.auth.repository.*;
import sn.diabete.auth.security.JwtTokenProvider;
import sn.diabete.auth.security.TokenBlacklist;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository    utilisateurRepository;
    private final RoleRepository           roleRepository;
    private final RefreshTokenRepository   refreshTokenRepository;
    private final PasswordEncoder          passwordEncoder;
    private final JwtTokenProvider         jwtTokenProvider;
    private final AuthenticationManager    authenticationManager;
    private final EmailService             emailService;
    private final TokenBlacklist           tokenBlacklist;

    // ═══════════════════════════════════════════════════════════════
    // INSCRIPTION
    // ═══════════════════════════════════════════════════════════════
    public RegisterResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Nom d'utilisateur déjà pris");
        }
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email déjà utilisé");
        }

        TypeRole typeRole;
        try {
            typeRole = TypeRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Rôle invalide. Valeurs acceptées : PATIENT, MEDECIN, INFIRMIER, ADMINISTRATEUR");
        }

        Role role = roleRepository.findByNom(typeRole)
                .orElseThrow(() -> new BadRequestException("Rôle non trouvé en base"));

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setUsername(request.getUsername());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setPassword(passwordEncoder.encode(request.getPassword()));
        utilisateur.setRole(role);
        utilisateur.setEnabled(typeRole == TypeRole.PATIENT || typeRole == TypeRole.ADMIN);
        utilisateur.setStatut(typeRole == TypeRole.MEDECIN ? StatutCompte.PENDING : StatutCompte.APPROVED);

        Utilisateur savedUser = utilisateurRepository.save(utilisateur);

        emailService.sendEmail(savedUser.getEmail(),
                "Bienvenue sur la plateforme SUIVIDIABETE SN !",
                String.format("""
                        Bonjour %s,

                        Votre inscription a bien été enregistrée sur la plateforme de suivi des patients diabétiques.

                        Si vous êtes un professionnel de santé, votre compte sera activé après validation par l'administrateur.

                        Merci,
                        L'équipe SUIVIDIABETE SN
                        """, savedUser.getUsername()));

        return new RegisterResponse("Utilisateur enregistré avec succès", savedUser.getId());
    }

    // ═══════════════════════════════════════════════════════════════
    // CONNEXION
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public AuthResponse login(AuthRequest request) {

        // 1. Vérifier existence
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email ou mot de passe incorrect"));

        // 2. Vérifier activation
        if (!utilisateur.isEnabled() || utilisateur.getStatut() != StatutCompte.APPROVED) {
            throw new ForbiddenException("Votre compte n'est pas encore activé. Statut actuel : "
                    + utilisateur.getStatut());
        }

        // 3. Authentifier
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 4. Générer access token
            String accessToken = jwtTokenProvider.generateToken(authentication);

            // 5. Générer refresh token et le persister
            String rawRefreshToken = jwtTokenProvider.generateRefreshToken();
            RefreshToken refreshToken = RefreshToken.builder()
                    .token(rawRefreshToken)
                    .utilisateur(utilisateur)
                    .expiresAt(Instant.now().plusMillis(jwtTokenProvider.getRefreshExpirationMs()))
                    .revoked(false)
                    .build();
            refreshTokenRepository.save(refreshToken);

            return new AuthResponse(
                    accessToken,
                    rawRefreshToken,
                    utilisateur.getId(),
                    utilisateur.getRole().getNom().name(),
                    jwtTokenProvider.getAccessTokenExpirationSeconds()
            );

        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            throw new BadCredentialsException("Email ou mot de passe incorrect");
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // REFRESH TOKEN
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {

        // 1. Retrouver le refresh token en base
        RefreshToken storedToken = refreshTokenRepository
                .findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Refresh token invalide ou inexistant"));

        // 2. Vérifier qu'il n'est pas révoqué
        if (storedToken.isRevoked()) {
            throw new BadRequestException("Refresh token déjà révoqué");
        }

        // 3. Vérifier l'expiration
        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new BadRequestException("Refresh token expiré, veuillez vous reconnecter");
        }

        // 4. Révoquer l'ancien (rotation)
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // 5. Générer un nouvel access token
        Utilisateur utilisateur = storedToken.getUtilisateur();
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                utilisateur.getEmail(), null, List.of(() -> "ROLE_" + utilisateur.getRole().getNom().name())
        );
        String newAccessToken = jwtTokenProvider.generateToken(authentication);

        // 6. Générer un nouveau refresh token
        String newRawRefreshToken = jwtTokenProvider.generateRefreshToken();
        RefreshToken newRefreshToken = RefreshToken.builder()
                .token(newRawRefreshToken)
                .utilisateur(utilisateur)
                .expiresAt(Instant.now().plusMillis(jwtTokenProvider.getRefreshExpirationMs()))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return new RefreshTokenResponse(
                newAccessToken,
                newRawRefreshToken,
                jwtTokenProvider.getAccessTokenExpirationSeconds()
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // LOGOUT
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public String logout(String bearerToken) {

        // 1. Blacklister l'access token courant
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String accessToken = bearerToken.substring(7);
            tokenBlacklist.blacklist(accessToken);
        }

        // 2. Révoquer tous les refresh tokens de l'utilisateur connecté
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        utilisateurRepository.findByEmail(email).ifPresent(
                refreshTokenRepository::revokeAllByUtilisateur
        );

        return "Déconnexion réussie — tokens révoqués";
    }

    // ═══════════════════════════════════════════════════════════════
    // PROFIL
    // ═══════════════════════════════════════════════════════════════
    public UserProfile getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        return new UserProfile(
                utilisateur.getId(),
                utilisateur.getUsername(),
                utilisateur.getEmail(),
                utilisateur.getRole().getNom().name(),
                utilisateur.getStatut()
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // MISE À JOUR MOT DE PASSE
    // ═══════════════════════════════════════════════════════════════
    public String updatePassword(PasswordUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getOldPassword(), utilisateur.getPassword())) {
            throw new BadRequestException("Ancien mot de passe incorrect");
        }

        utilisateur.setPassword(passwordEncoder.encode(request.getNewPassword()));
        utilisateurRepository.save(utilisateur);
        return "Mot de passe mis à jour avec succès";
    }

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION TOKEN (inter-services)
    // ═══════════════════════════════════════════════════════════════
    public TokenValidationResponse validateToken(String bearerToken) {
        try {
            String token = bearerToken.replace("Bearer ", "");

            // Vérifier la blacklist avant de valider
            if (tokenBlacklist.isBlacklisted(token)) {
                return new TokenValidationResponse(false, null, null, null,
                        "Token révoqué (logout effectué)");
            }

            if (jwtTokenProvider.validateToken(token)) {
                return new TokenValidationResponse(
                        true,
                        jwtTokenProvider.getUserIdFromToken(token),
                        jwtTokenProvider.getEmailFromToken(token),
                        jwtTokenProvider.getRoleFromToken(token),
                        "Token valide"
                );
            }
            return new TokenValidationResponse(false, null, null, null, "Token invalide");

        } catch (Exception e) {
            return new TokenValidationResponse(false, null, null, null,
                    "Erreur de validation : " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // APPROBATION / REJET DES PROFESSIONNELS
    // ═══════════════════════════════════════════════════════════════
    public String approveProfessional(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur avec l'ID " + userId + " non trouvé"));

        if (user.getRole().getNom() != TypeRole.MEDECIN) {
            throw new BadRequestException("Seuls les professionnels de santé (MEDECIN) peuvent être approuvés");
        }
        if (user.getStatut() == StatutCompte.APPROVED) {
            throw new BadRequestException("Ce professionnel est déjà approuvé");
        }

        user.setStatut(StatutCompte.APPROVED);
        user.setEnabled(true);
        utilisateurRepository.save(user);

        emailService.sendEmail(user.getEmail(), "Activation de votre compte",
                String.format("""
                        Bonjour Dr %s,

                        Votre compte professionnel a été approuvé par l'administrateur et est maintenant actif.

                        Merci,
                        L'équipe SUIVIDIABETE SN
                        """, user.getUsername()));

        return "Professionnel approuvé avec succès";
    }

    public String rejectProfessional(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur avec l'ID " + userId + " non trouvé"));

        if (user.getRole().getNom() != TypeRole.MEDECIN) {
            throw new BadRequestException("Seuls les professionnels de santé (MEDECIN) peuvent être rejetés");
        }
        if (user.getStatut() == StatutCompte.REJECTED) {
            throw new BadRequestException("Ce professionnel est déjà rejeté");
        }

        user.setStatut(StatutCompte.REJECTED);
        user.setEnabled(false);
        utilisateurRepository.save(user);

        emailService.sendEmail(user.getEmail(), "Rejet de votre compte",
                String.format("""
                        Bonjour Dr %s,

                        Votre demande d'inscription en tant que professionnel de santé a été rejetée par l'administrateur.

                        Merci,
                        L'équipe SUIVIDIABETE SN
                        """, user.getUsername()));

        return "Professionnel rejeté avec succès";
    }

    // ═══════════════════════════════════════════════════════════════
    // LISTE DES UTILISATEURS — paginée
    // ═══════════════════════════════════════════════════════════════
    public Page<UserDto> getAllUsersDto(Pageable pageable) {
        return utilisateurRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    public UserDto getUserByIdDto(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur avec l'ID " + id + " non trouvé"));
        return convertToDto(utilisateur);
    }

    public UserDto getUserByUsernameDto(String username) {
        Utilisateur utilisateur = utilisateurRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur avec le username '" + username + "' non trouvé"));
        return convertToDto(utilisateur);
    }

    public List<UserDto> getUsersByIds(List<Long> userIds) {
        return utilisateurRepository.findAllById(userIds).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════
    // PROFESSIONNELS EN ATTENTE — paginée
    // ═══════════════════════════════════════════════════════════════
    public Page<UserDto> getAllPendingProfessionals(Pageable pageable) {
        Role medecinRole = roleRepository.findByNom(TypeRole.MEDECIN)
                .orElseThrow(() -> new BadRequestException("Rôle MEDECIN non trouvé"));

        return utilisateurRepository
                .findByStatutAndRoleIn(StatutCompte.PENDING, List.of(medecinRole), pageable)
                .map(this::convertToDto);
    }

    // ═══════════════════════════════════════════════════════════════
    // SUPPRESSION
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public void deleteUser(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur avec l'ID " + userId + " non trouvé"));

        if (user.getRole().getNom() == TypeRole.ADMIN) {
            throw new BadRequestException("Impossible de supprimer un compte administrateur");
        }

        // Révoquer tous ses refresh tokens avant suppression
        refreshTokenRepository.revokeAllByUtilisateur(user);

        utilisateurRepository.delete(user);
    }

    // ═══════════════════════════════════════════════════════════════
    // EMAIL PAR ID (inter-services)
    // ═══════════════════════════════════════════════════════════════
    public String getUserEmailById(Long userId) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur avec l'ID " + userId + " non trouvé"));
        return utilisateur.getEmail();
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITAIRES PRIVÉS
    // ═══════════════════════════════════════════════════════════════
    private UserDto convertToDto(Utilisateur utilisateur) {
        return new UserDto(
                utilisateur.getId(),
                utilisateur.getUsername(),
                utilisateur.getEmail(),
                utilisateur.getRole().getNom().name(),
                utilisateur.getStatut()
        );
    }
}