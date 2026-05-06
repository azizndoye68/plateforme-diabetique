package sn.diabete.suivimedical.dto;


import lombok.Data;

@Data
public class GlycemieRequest {

    private Long patientId; // Référence vers le patient concerné

    private Double glycemie;           // Taux de glycémie (g/l)

    private String moment;             // Moment de la prise (avant_repas, apres_repas, etc.)

    private String repas;              // Type de repas (petit_dejeuner, dejeuner, etc.)

}

