package sn.diabete.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import sn.diabete.auth.entity.Utilisateur;
import sn.diabete.auth.repository.UtilisateurRepository;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Utilisateur non trouvé avec l'email : " + email
                        )
                );

        GrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole().getNom().name());

        return new org.springframework.security.core.userdetails.User(
                utilisateur.getEmail(),      // ✅ principal = email
                utilisateur.getPassword(),
                utilisateur.isEnabled(),     // enabled
                true,                         // accountNonExpired
                true,                         // credentialsNonExpired
                true,                         // accountNonLocked
                Collections.singleton(authority)
        );
    }
}
