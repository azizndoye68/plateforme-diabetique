// ============================================================
// WebSocketConfig.java - MODIFIER dans communication-service
// ============================================================
package sn.diabete.communication.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import sn.diabete.communication.security.ChatPrincipal;
import sn.diabete.communication.security.JwtSupport;
import sn.diabete.communication.service.ChatActorService;
import sn.diabete.communication.entity.SenderType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtSupport jwtSupport;
    private final ChatActorService chatActorService;
    @Value("${chat.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins.split(","));
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message,
                    org.springframework.messaging.MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String auth = accessor.getFirstNativeHeader("Authorization");
                    if (auth == null || !auth.startsWith("Bearer ")) throw new IllegalArgumentException("Authentification requise");
                    ChatPrincipal principal = jwtSupport.authenticate(auth.substring(7));
                    accessor.setUser(new UsernamePasswordAuthenticationToken(principal, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + principal.role()))));
                } else if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    if (!(accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication)
                            || !(authentication.getPrincipal() instanceof ChatPrincipal principal))
                        throw new IllegalArgumentException("Authentification requise");
                    String destination = accessor.getDestination();
                    if (destination == null || destination.startsWith("/user/queue/")) return message;
                    var actor = chatActorService.resolve(principal);
                    String expectedPrefix = actor.type() == SenderType.PATIENT ? "/topic/patient/" : "/topic/medecin/";
                    String expectedDestination = expectedPrefix + actor.profileId() + "/messages";
                    if (!expectedDestination.equals(destination)) throw new SecurityException("Abonnement refusé");
                } else if (accessor != null && StompCommand.SEND.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    if (destination == null || !destination.startsWith("/app/"))
                        throw new SecurityException("Destination d'envoi refusée");
                }
                return message;
            }
        });
    }
}
