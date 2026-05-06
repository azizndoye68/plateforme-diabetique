package sn.diabete.auth.security;

import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Blacklist en mémoire pour les access tokens révoqués au logout.
 * Pour la production, remplacer par Redis.
 */
@Component
public class TokenBlacklist {

    private final Set<String> blacklistedTokens =
            Collections.synchronizedSet(new HashSet<>());

    public void blacklist(String token) {
        blacklistedTokens.add(token);
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    public void clear() {
        blacklistedTokens.clear();
    }
}