package sn.diabete.suivimedical.service;

import sn.diabete.suivimedical.dto.JournalBordRequest;
import sn.diabete.suivimedical.dto.JournalBordResponse;

import java.util.List;

public interface JournalBordService {

    JournalBordResponse create(JournalBordRequest request);

    JournalBordResponse getById(Long id);

    List<JournalBordResponse> getByPatientId(Long patientId);

    JournalBordResponse update(Long id, JournalBordRequest request);

    void delete(Long id);
}
