package sn.diabete.suivimedical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.suivimedical.client.PatientClient;
import sn.diabete.suivimedical.dto.JournalBordRequest;
import sn.diabete.suivimedical.dto.JournalBordResponse;
import sn.diabete.suivimedical.entity.JournalBord;
import sn.diabete.suivimedical.exception.ResourceNotFoundException;
import sn.diabete.suivimedical.mapper.JournalBordMapper;
import sn.diabete.suivimedical.repository.JournalBordRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JournalBordServiceImpl implements JournalBordService {

    private final JournalBordRepository repository;
    private final JournalBordMapper mapper;
    private final PatientClient patientClient;

    @Override
    public JournalBordResponse create(JournalBordRequest request) {

        // 🔹 Vérifier l'existence du patient via Feign
        try {
            patientClient.getPatientById(request.getPatientId());
        } catch (Exception e) {
            throw new ResourceNotFoundException(
                    "Patient introuvable : " + request.getPatientId()
            );
        }

        JournalBord entity = mapper.toEntity(request);
        entity.setDateSuivi(LocalDateTime.now());

        JournalBord saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    public JournalBordResponse getById(Long id) {
        JournalBord entity = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Journal de bord non trouvé : " + id));
        return mapper.toResponse(entity);
    }

    @Override
    public List<JournalBordResponse> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByDateSuiviDesc(patientId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public JournalBordResponse update(Long id, JournalBordRequest request) {
        JournalBord entity = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Journal de bord non trouvé : " + id));

        entity.setRepas(request.getRepas());
        entity.setActivitePhysique(request.getActivitePhysique());
        entity.setSymptomes(request.getSymptomes());
        entity.setEvenements(request.getEvenements());

        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public void delete(Long id) {
        JournalBord entity = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Journal de bord non trouvé : " + id));
        repository.delete(entity);
    }
}
