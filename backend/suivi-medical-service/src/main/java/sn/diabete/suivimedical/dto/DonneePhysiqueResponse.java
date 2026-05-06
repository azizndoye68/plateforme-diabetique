package sn.diabete.suivimedical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DonneePhysiqueResponse {

    private Long id;

    private Long patientId;

    private Double poids;
    private String tension;

    private LocalDateTime dateSuivi;
}
