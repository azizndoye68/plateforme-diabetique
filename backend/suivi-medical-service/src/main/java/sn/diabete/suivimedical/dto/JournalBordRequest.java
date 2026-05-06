package sn.diabete.suivimedical.dto;

import lombok.Data;

@Data
public class JournalBordRequest {

    private Long patientId;

    private String repas;
    private String activitePhysique;
    private String symptomes;
    private String evenements;
}
