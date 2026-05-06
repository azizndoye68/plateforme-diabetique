package sn.diabete.communication.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedecinInfoDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String specialite;
}