package sn.diabete.patient.dto;

import lombok.*;
import sn.diabete.patient.entity.TypeConseil;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConseilPersonnaliseRequest {
    private String titre;
    private String description;
    private TypeConseil typeConseil;  // TEXTE, VIDEO ou PDF
    private String lienVideo;         // Requis si typeConseil = VIDEO
    private Long patientId;
}