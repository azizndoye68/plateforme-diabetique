package sn.diabete.notification.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
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
    private String statut;
    private String typeEvenement;
    private LocalDateTime eventTimestamp;
}