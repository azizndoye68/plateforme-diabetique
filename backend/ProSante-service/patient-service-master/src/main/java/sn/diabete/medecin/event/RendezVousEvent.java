package sn.diabete.medecin.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.diabete.medecin.entity.StatutRendezVous;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RendezVousEvent implements Serializable {

    private Long rendezVousId;
    private Long patientId;
    private Long medecinId;
    private Long medecinUtilisateurId; // 🆕
    private String medecinNom;
    private String medecinPrenom;
    private LocalDateTime dateRdv;
    private String motif;
    private StatutRendezVous statut;
    private String typeEvenement;
    private LocalDateTime eventTimestamp;
}