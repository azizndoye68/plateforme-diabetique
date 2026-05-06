package sn.diabete.patient.dto;

import lombok.Data;

@Data
public class DossierMedicalResponse {

    private Long id;

    private String traitement;

    private String antecedents;

    private String allergies;

    private String notesMedicales;

    private Long patientId;
}
