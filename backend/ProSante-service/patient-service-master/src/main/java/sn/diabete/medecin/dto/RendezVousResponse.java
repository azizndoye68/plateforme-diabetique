package sn.diabete.medecin.dto;

import lombok.Data;
import sn.diabete.medecin.entity.StatutRendezVous;
import java.time.LocalDateTime;

@Data
public class RendezVousResponse {
    private Long id;
    private Long patientId;
    private LocalDateTime dateRdv;
    private String motif;
    private StatutRendezVous statut;
    private Long medecinId; // médecin qui a planifié
    private String medecinNom;
    private String medecinPrenom;
}
