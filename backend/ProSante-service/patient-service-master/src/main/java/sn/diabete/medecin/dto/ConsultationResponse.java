package sn.diabete.medecin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConsultationResponse {

    private Long id;
    private Long patientId;

    private LocalDateTime dateConsultation;
    private String motif;
    private String diagnostic;
    private String prescription;

    private Long medecinId;
    private String medecinNom;
    private String medecinPrenom;
}
