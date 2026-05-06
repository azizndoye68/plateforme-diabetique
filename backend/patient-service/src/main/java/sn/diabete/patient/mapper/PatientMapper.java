package sn.diabete.patient.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sn.diabete.patient.dto.PatientRequest;
import sn.diabete.patient.dto.PatientResponse;
import sn.diabete.patient.entity.Patient;

import java.util.List;

@Mapper
public interface PatientMapper {

    PatientMapper INSTANCE = Mappers.getMapper(PatientMapper.class);

    // DTO -> Entity (ajout explicite de utilisateurId)
    @Mapping(source = "utilisateurId", target = "utilisateurId")
    @Mapping(source = "medecinId", target = "medecinId") // 🔹 ajouter cette ligne

    Patient toEntity(PatientRequest request);

    // Entity -> DTO
    PatientResponse toDto(Patient patient);

    // Entity List -> DTO List
    List<PatientResponse> toDtoList(List<Patient> patients);
}
