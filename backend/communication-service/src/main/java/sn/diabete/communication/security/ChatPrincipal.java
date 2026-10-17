package sn.diabete.communication.security;

import java.security.Principal;

public record ChatPrincipal(Long userId, String role) implements Principal {
    @Override public String getName() { return userId.toString(); }
}
