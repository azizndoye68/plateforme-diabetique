package sn.diabete.communication.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembreEquipeDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String specialite;
}
