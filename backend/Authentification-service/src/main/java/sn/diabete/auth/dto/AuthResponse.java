package sn.diabete.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;      // renommé pour clarté (était "token")
    private String refreshToken;     // NOUVEAU
    private Long utilisateurId;
    private String role;
    private long expireEn;           // NOUVEAU — durée en secondes (ex: 900)
}