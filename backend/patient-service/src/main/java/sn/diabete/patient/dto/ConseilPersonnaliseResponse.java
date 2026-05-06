package sn.diabete.patient.dto;

import lombok.*;
import sn.diabete.patient.entity.TypeConseil;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConseilPersonnaliseResponse {
    private Long id;
    private String titre;
    private String description;
    private TypeConseil typeConseil;
    private String lienVideo;
    private String urlPdf;        // URL publique du PDF pour téléchargement
    private String nomFichierPdf;
    private LocalDate dateCreation;
    private Long patientId;
    private String nomPatient;    // Bonus : nom du patient pour l'affichage
}