package sn.diabete.medecin.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sn.diabete.medecin.dto.RendezVousRequest;
import sn.diabete.medecin.dto.RendezVousResponse;
import sn.diabete.medecin.entity.RendezVous;

import java.util.List;


@Mapper(componentModel = "spring") // 🔹 Ajouté
public interface RendezVousMapper {

    RendezVousMapper INSTANCE = Mappers.getMapper(RendezVousMapper.class);

    // Request -> Entity
    @Mapping(source = "medecinId", target = "medecin.id")
    RendezVous toEntity(RendezVousRequest request);

    // Entity -> Response
    @Mapping(source = "medecin.id", target = "medecinId")
    @Mapping(source = "medecin.nom", target = "medecinNom")
    @Mapping(source = "medecin.prenom", target = "medecinPrenom")
    RendezVousResponse toResponse(RendezVous rendezVous);

    List<RendezVousResponse> toResponseList(List<RendezVous> rendezVousList);
}
