package sn.diabete.medecin.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.diabete.medecin.dto.ConsultationRequest;
import sn.diabete.medecin.dto.ConsultationResponse;
import sn.diabete.medecin.entity.Consultation;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ConsultationMapper {

    @Mapping(source = "medecinId", target = "medecin.id")
    Consultation toEntity(ConsultationRequest request);

    @Mapping(source = "medecin.id", target = "medecinId")
    @Mapping(source = "medecin.nom", target = "medecinNom")
    @Mapping(source = "medecin.prenom", target = "medecinPrenom")
    ConsultationResponse toResponse(Consultation consultation);

    List<ConsultationResponse> toResponseList(List<Consultation> consultations);
}
