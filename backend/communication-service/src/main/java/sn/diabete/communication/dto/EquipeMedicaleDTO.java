package sn.diabete.communication.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipeMedicaleDTO {
    private Long equipeMedicaleId;
    private Long proprietaireId;
    private List<MembreEquipeDTO> membres;
}