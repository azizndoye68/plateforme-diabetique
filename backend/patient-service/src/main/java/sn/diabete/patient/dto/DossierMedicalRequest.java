package sn.diabete.patient.dto;

import lombok.Data;

@Data
public class DossierMedicalRequest {

    private String traitement;

    private String antecedents;

    private String allergies;

    private String notesMedicales;

    private Long patientId; // Id du patient pour créer le dossier
}
