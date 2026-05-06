package sn.diabete.medecin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EquipeMedicaleResponse {

    private Long id;
    private String nom;

    private Long medecinProprietaireId;
    private List<Long> medecinsIds;
}
