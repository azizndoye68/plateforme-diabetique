package sn.diabete.suivimedical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JournalBordResponse {

    private Long id;

    private Long patientId;

    private String repas;
    private String activitePhysique;
    private String symptomes;
    private String evenements;

    private LocalDateTime dateSuivi;
}
