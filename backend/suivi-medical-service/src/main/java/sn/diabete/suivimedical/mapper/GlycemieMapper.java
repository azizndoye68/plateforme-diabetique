package sn.diabete.suivimedical.mapper;


import org.mapstruct.Mapper;
import sn.diabete.suivimedical.dto.GlycemieRequest;
import sn.diabete.suivimedical.dto.GlycemieResponse;
import sn.diabete.suivimedical.entity.Glycemie;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GlycemieMapper {


    Glycemie toSuivi(GlycemieRequest glycemieRequest);

    GlycemieResponse toSuiviResponse(Glycemie glycemie);

    List<GlycemieResponse> toSuiviResponseList(List<Glycemie> glycemies);
}
