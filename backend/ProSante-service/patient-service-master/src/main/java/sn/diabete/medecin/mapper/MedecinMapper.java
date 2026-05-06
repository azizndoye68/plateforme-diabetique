package sn.diabete.medecin.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sn.diabete.medecin.dto.MedecinRequest;
import sn.diabete.medecin.dto.MedecinResponse;
import sn.diabete.medecin.entity.Medecin;

import java.util.List;

@Mapper
public interface MedecinMapper {

    MedecinMapper INSTANCE = Mappers.getMapper(MedecinMapper.class);

    // DTO -> Entity (ajout explicite de utilisateurId)
    @Mapping(source = "utilisateurId", target = "utilisateurId")
    Medecin toEntity(MedecinRequest request);

    // Entity -> DTO
    MedecinResponse toDto(Medecin medecin);

    // Entity List -> DTO List
    List<MedecinResponse> toDtoList(List<Medecin> medecins);
}
