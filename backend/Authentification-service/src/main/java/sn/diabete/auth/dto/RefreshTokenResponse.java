// RefreshTokenResponse.java
package sn.diabete.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RefreshTokenResponse {
    private String accessToken;
    private String refreshToken; // nouveau token (rotation)
    private long expireEn;       // en secondes
}