package sn.diabete.suivimedical.service;

import sn.diabete.suivimedical.dto.GlycemieRequest;
import sn.diabete.suivimedical.dto.GlycemieResponse;

import java.util.List;

public interface GlycemieService {

    GlycemieResponse createSuivi(GlycemieRequest glycemieRequest);

    List<GlycemieResponse> getAllSuivis();

    GlycemieResponse getSuiviById(Long id);

    GlycemieResponse updateSuivi(Long id, GlycemieRequest glycemieRequest);

    void deleteSuivi(Long id);

    GlycemieResponse getLastSuiviByPatientId(Long patientId);

    List<GlycemieResponse> getRecentSuivisByPatientId(Long patientId);

}
