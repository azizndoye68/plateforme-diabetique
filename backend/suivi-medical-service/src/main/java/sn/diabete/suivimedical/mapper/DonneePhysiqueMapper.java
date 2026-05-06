package sn.diabete.suivimedical.mapper;

import org.mapstruct.Mapper;
import sn.diabete.suivimedical.dto.DonneePhysiqueRequest;
import sn.diabete.suivimedical.dto.DonneePhysiqueResponse;
import sn.diabete.suivimedical.entity.DonneePhysique;

@Mapper(componentModel = "spring")
public interface DonneePhysiqueMapper {

    DonneePhysique toEntity(DonneePhysiqueRequest dto);

    DonneePhysiqueResponse toResponse(DonneePhysique entity);
}
