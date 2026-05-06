package sn.diabete.patient.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObjectifSanteResponse {
    private Long id;
    private String libelle;
    private String valeurCible;
    private LocalDate dateCreation;
    private Long patientId;
}
