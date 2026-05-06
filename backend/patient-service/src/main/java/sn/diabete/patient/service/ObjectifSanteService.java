package sn.diabete.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.patient.dto.ObjectifSanteRequest;
import sn.diabete.patient.dto.ObjectifSanteResponse;
import sn.diabete.patient.entity.ObjectifSante;
import sn.diabete.patient.entity.Patient;
import sn.diabete.patient.exception.ResourceNotFoundException;
import sn.diabete.patient.mapper.ObjectifSanteMapper;
import sn.diabete.patient.repository.ObjectifSanteRepository;
import sn.diabete.patient.repository.PatientRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ObjectifSanteService {

    private final ObjectifSanteRepository objectifSanteRepository;
    private final PatientRepository patientRepository;

    // 🔹 Créer un objectif
    public ObjectifSanteResponse createObjectif(ObjectifSanteRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID : " + request.getPatientId()));

        ObjectifSante objectif = ObjectifSanteMapper.INSTANCE.toEntity(request);
        objectif.setPatient(patient);

        ObjectifSante saved = objectifSanteRepository.save(objectif);
        return ObjectifSanteMapper.INSTANCE.toDto(saved);
    }

    // 🔹 Récupérer tous les objectifs
    public List<ObjectifSanteResponse> getAllObjectifs() {
        return ObjectifSanteMapper.INSTANCE.toDtoList(objectifSanteRepository.findAll());
    }

    // 🔹 Récupérer les objectifs d’un patient
    public List<ObjectifSanteResponse> getObjectifsByPatient(Long patientId) {
        return ObjectifSanteMapper.INSTANCE.toDtoList(objectifSanteRepository.findByPatientId(patientId));
    }

    // 🔹 Récupérer un objectif par ID
    public ObjectifSanteResponse getObjectifById(Long id) {
        ObjectifSante objectif = objectifSanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Objectif non trouvé avec l'ID : " + id));
        return ObjectifSanteMapper.INSTANCE.toDto(objectif);
    }

    // 🔹 Mettre à jour un objectif
    public ObjectifSanteResponse updateObjectif(Long id, ObjectifSanteRequest request) {
        ObjectifSante objectif = objectifSanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Objectif non trouvé avec l'ID : " + id));

        objectif.setLibelle(request.getLibelle());
        objectif.setValeurCible(request.getValeurCible());

        if (request.getPatientId() != null && !request.getPatientId().equals(objectif.getPatient().getId())) {
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID : " + request.getPatientId()));
            objectif.setPatient(patient);
        }

        ObjectifSante updated = objectifSanteRepository.save(objectif);
        return ObjectifSanteMapper.INSTANCE.toDto(updated);
    }

    // 🔹 Supprimer un objectif
    public void deleteObjectif(Long id) {
        ObjectifSante objectif = objectifSanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Objectif non trouvé avec l'ID : " + id));
        objectifSanteRepository.delete(objectif);
    }
}
