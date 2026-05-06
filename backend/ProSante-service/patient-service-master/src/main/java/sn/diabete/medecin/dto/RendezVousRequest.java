package sn.diabete.medecin.dto;

import lombok.Data;
import sn.diabete.medecin.entity.StatutRendezVous;
import java.time.LocalDateTime;

@Data
public class RendezVousRequest {
    private Long patientId;
    private LocalDateTime dateRdv;
    private String motif;
    private StatutRendezVous statut;
    private Long medecinId; // pour lier au médecin
}
