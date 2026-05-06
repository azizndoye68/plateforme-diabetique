package sn.diabete.medecin.mapper;

import org.springframework.stereotype.Component;
import sn.diabete.medecin.dto.EquipeMedicaleResponse;
import sn.diabete.medecin.entity.EquipeMedicale;

import java.util.stream.Collectors;

@Component
public class EquipeMedicaleMapper {

    public EquipeMedicaleResponse toResponse(EquipeMedicale equipe) {
        return EquipeMedicaleResponse.builder()
                .id(equipe.getId())
                .nom(equipe.getNom())
                .medecinProprietaireId(equipe.getMedecinProprietaire().getId())
                .medecinsIds(
                        equipe.getMedecins()
                                .stream()
                                .map(m -> m.getId())
                                .collect(Collectors.toList())
                )
                .build();
    }
}
