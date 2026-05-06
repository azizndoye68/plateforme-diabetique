package sn.diabete.suivimedical.service;

import sn.diabete.suivimedical.dto.DonneePhysiqueRequest;
import sn.diabete.suivimedical.dto.DonneePhysiqueResponse;

import java.util.List;

public interface DonneePhysiqueService {

    DonneePhysiqueResponse create(DonneePhysiqueRequest request);

    DonneePhysiqueResponse getById(Long id);

    List<DonneePhysiqueResponse> getByPatientId(Long patientId);

    DonneePhysiqueResponse update(Long id, DonneePhysiqueRequest request);

    void delete(Long id);
}
