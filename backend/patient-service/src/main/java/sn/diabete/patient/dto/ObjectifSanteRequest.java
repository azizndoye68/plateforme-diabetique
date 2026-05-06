package sn.diabete.patient.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObjectifSanteRequest {
    private String libelle;
    private String valeurCible;
    private Long patientId; // 🔹 On lie l'objectif au patient
}
