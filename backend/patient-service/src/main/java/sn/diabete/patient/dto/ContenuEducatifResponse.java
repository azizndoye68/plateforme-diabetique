package sn.diabete.patient.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContenuEducatifResponse {
    private Long id;
    private String titre;
    private String type;
    private String url;
    private LocalDate datePublication;
}
