package sn.diabete.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import sn.diabete.auth.entity.StatutCompte;


@Data
@AllArgsConstructor
public class UserProfile {
    private Long id;
    private String username;
    private String email;
    private String role;
    private StatutCompte statut; // PENDING, APPROVED, REJECTED

}
