package sn.diabete.communication.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class ChatSecurityConfig {
    private final JwtSupport jwtSupport;

    @Bean
    SecurityFilterChain chatSecurityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a.requestMatchers("/ws", "/ws/**", "/actuator/health", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtFilter(jwtSupport), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    private static final class JwtFilter extends OncePerRequestFilter {
        private final JwtSupport jwtSupport;
        private JwtFilter(JwtSupport jwtSupport) { this.jwtSupport = jwtSupport; }
        @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws ServletException, IOException {
            String header = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (header != null && header.startsWith("Bearer ")) {
                try {
                    ChatPrincipal principal = jwtSupport.authenticate(header.substring(7));
                    var auth = new UsernamePasswordAuthenticationToken(principal, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + principal.role())));
                    org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);
                } catch (RuntimeException ex) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Jeton invalide ou expiré");
                    return;
                }
            }
            chain.doFilter(request, response);
        }
    }
}
