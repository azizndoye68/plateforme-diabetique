package sn.diabete.patient.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContenuEducatifRequest {
    private String titre;
    private String type; // ARTICLE, VIDEO, PDF
    private String url;
}
