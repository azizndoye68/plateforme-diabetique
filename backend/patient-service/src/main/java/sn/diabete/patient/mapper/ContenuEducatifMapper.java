package sn.diabete.patient.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import sn.diabete.patient.dto.ContenuEducatifRequest;
import sn.diabete.patient.dto.ContenuEducatifResponse;
import sn.diabete.patient.entity.ContenuEducatif;

import java.util.List;

@Mapper
public interface ContenuEducatifMapper {

    ContenuEducatifMapper INSTANCE = Mappers.getMapper(ContenuEducatifMapper.class);

    ContenuEducatif toEntity(ContenuEducatifRequest request);

    ContenuEducatifResponse toDto(ContenuEducatif contenuEducatif);

    List<ContenuEducatifResponse> toDtoList(List<ContenuEducatif> contenus);
}
