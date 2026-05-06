package sn.diabete.suivimedical.mapper;

import org.mapstruct.Mapper;
import sn.diabete.suivimedical.dto.JournalBordRequest;
import sn.diabete.suivimedical.dto.JournalBordResponse;
import sn.diabete.suivimedical.entity.JournalBord;

@Mapper(componentModel = "spring")
public interface JournalBordMapper {

    JournalBord toEntity(JournalBordRequest dto);

    JournalBordResponse toResponse(JournalBord entity);
}
