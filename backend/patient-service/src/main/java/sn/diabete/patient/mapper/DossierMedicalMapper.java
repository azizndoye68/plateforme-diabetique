package sn.diabete.patient.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sn.diabete.patient.dto.DossierMedicalRequest;
import sn.diabete.patient.dto.DossierMedicalResponse;
import sn.diabete.patient.entity.DossierMedical;
import sn.diabete.patient.entity.Patient;

import java.util.List;

@Mapper
public interface DossierMedicalMapper {

    DossierMedicalMapper INSTANCE = Mappers.getMapper(DossierMedicalMapper.class);

    @Mapping(source = "patient", target = "patient")
    DossierMedical toEntity(DossierMedicalRequest request, Patient patient);

    @Mapping(source = "patient.id", target = "patientId")
    DossierMedicalResponse toDto(DossierMedical dossierMedical);

    List<DossierMedicalResponse> toDtoList(List<DossierMedical> dossiers);
}
