package sn.diabete.medecin.dto;

import lombok.Data;

@Data
public class ConsultationRequest {

    private Long patientId;
    private Long medecinId;

    private String motif;
    private String diagnostic;
    private String prescription;
}
