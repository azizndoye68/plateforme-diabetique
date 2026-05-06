package sn.diabete.suivimedical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.suivimedical.client.PatientClient;
import sn.diabete.suivimedical.dto.DonneePhysiqueRequest;
import sn.diabete.suivimedical.dto.DonneePhysiqueResponse;
import sn.diabete.suivimedical.entity.DonneePhysique;
import sn.diabete.suivimedical.exception.ResourceNotFoundException;
import sn.diabete.suivimedical.mapper.DonneePhysiqueMapper;
import sn.diabete.suivimedical.repository.DonneePhysiqueRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonneePhysiqueServiceImpl implements DonneePhysiqueService {

    private final DonneePhysiqueRepository repository;
    private final DonneePhysiqueMapper mapper;
    private final PatientClient patientClient;

    @Override
    public DonneePhysiqueResponse create(DonneePhysiqueRequest request) {

        // 🔹 Vérifier l'existence du patient via Feign
        try {
            patientClient.getPatientById(request.getPatientId());
        } catch (Exception e) {
            throw new ResourceNotFoundException(
                    "Patient introuvable : " + request.getPatientId()
            );
        }

        DonneePhysique entity = mapper.toEntity(request);
        entity.setDateSuivi(LocalDateTime.now());

        DonneePhysique saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    public DonneePhysiqueResponse getById(Long id) {
        DonneePhysique entity = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Donnée physique non trouvée : " + id));
        return mapper.toResponse(entity);
    }

    @Override
    public List<DonneePhysiqueResponse> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByDateSuiviDesc(patientId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DonneePhysiqueResponse update(Long id, DonneePhysiqueRequest request) {
        DonneePhysique entity = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Donnée physique non trouvée : " + id));

        entity.setPoids(request.getPoids());
        entity.setTension(request.getTension());

        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public void delete(Long id) {
        DonneePhysique entity = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Donnée physique non trouvée : " + id));
        repository.delete(entity);
    }
}
