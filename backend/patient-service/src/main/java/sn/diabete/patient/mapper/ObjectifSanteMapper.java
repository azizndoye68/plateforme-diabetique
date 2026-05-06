package sn.diabete.patient.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sn.diabete.patient.dto.ObjectifSanteRequest;
import sn.diabete.patient.dto.ObjectifSanteResponse;
import sn.diabete.patient.entity.ObjectifSante;

import java.util.List;

@Mapper
public interface ObjectifSanteMapper {

    ObjectifSanteMapper INSTANCE = Mappers.getMapper(ObjectifSanteMapper.class);

    @Mapping(source = "patientId", target = "patient.id")
    ObjectifSante toEntity(ObjectifSanteRequest request);

    @Mapping(source = "patient.id", target = "patientId")
    ObjectifSanteResponse toDto(ObjectifSante objectifSante);

    List<ObjectifSanteResponse> toDtoList(List<ObjectifSante> objectifs);
}
