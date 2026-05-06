package sn.diabete.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.diabete.auth.entity.StatutCompte;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private StatutCompte statut; // PENDING, APPROVED, REJECTED
}
