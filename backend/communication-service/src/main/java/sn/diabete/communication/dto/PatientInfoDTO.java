package sn.diabete.communication.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientInfoDTO {
    private Long id;
    private String nom;
    private String prenom;
    private Long medecinId;
    private String numeroDossier;
}