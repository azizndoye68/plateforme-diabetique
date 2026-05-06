package sn.diabete.suivimedical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.diabete.suivimedical.enums.NiveauAlerte;
import sn.diabete.suivimedical.enums.TypeAlerte;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GlycemieResponse {

    private Long id;
    private Long patientId;
    private Double glycemie;
    private String moment;
    private String repas;
    private LocalDateTime dateSuivi;

    // 🆕 Nouveaux champs
    private NiveauAlerte niveauAlerte;
    private TypeAlerte typeAlerte;
    private Boolean evenementEnvoye;
}
