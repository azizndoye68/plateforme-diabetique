package sn.diabete.patient.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sn.diabete.patient.dto.ConseilPersonnaliseRequest;
import sn.diabete.patient.dto.ConseilPersonnaliseResponse;
import sn.diabete.patient.entity.ConseilPersonnalise;

import java.util.List;

@Mapper
public interface ConseilPersonnaliseMapper {

    ConseilPersonnaliseMapper INSTANCE = Mappers.getMapper(ConseilPersonnaliseMapper.class);

    @Mapping(source = "patientId", target = "patient.id")
    ConseilPersonnalise toEntity(ConseilPersonnaliseRequest request);

    @Mapping(source = "patient.id", target = "patientId")
    ConseilPersonnaliseResponse toDto(ConseilPersonnalise conseil);

    List<ConseilPersonnaliseResponse> toDtoList(List<ConseilPersonnalise> conseils);
}
