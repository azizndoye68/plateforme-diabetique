package sn.diabete.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.patient.dto.DossierMedicalRequest;
import sn.diabete.patient.dto.DossierMedicalResponse;
import sn.diabete.patient.entity.DossierMedical;
import sn.diabete.patient.entity.Patient;
import sn.diabete.patient.exception.BadRequestException;
import sn.diabete.patient.exception.ResourceNotFoundException;
import sn.diabete.patient.mapper.DossierMedicalMapper;
import sn.diabete.patient.repository.DossierMedicalRepository;
import sn.diabete.patient.repository.PatientRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DossierMedicalService {

    private final DossierMedicalRepository dossierMedicalRepository;
    private final PatientRepository patientRepository;

    // Créer un dossier médical pour un patient
    public DossierMedicalResponse createDossier(DossierMedicalRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID : " + request.getPatientId()));

        if (dossierMedicalRepository.existsByPatientId(patient.getId())) {
            throw new BadRequestException("Le patient a déjà un dossier médical.");
        }

        DossierMedical dossier = DossierMedicalMapper.INSTANCE.toEntity(request, patient);
        DossierMedical saved = dossierMedicalRepository.save(dossier);
        return DossierMedicalMapper.INSTANCE.toDto(saved);
    }

    // Récupérer un dossier par ID
    public DossierMedicalResponse getDossierById(Long id) {
        DossierMedical dossier = dossierMedicalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier médical non trouvé avec l'ID : " + id));
        return DossierMedicalMapper.INSTANCE.toDto(dossier);
    }

    // Récupérer le dossier d’un patient
    public DossierMedicalResponse getDossierByPatientId(Long patientId) {
        return dossierMedicalRepository.findByPatientId(patientId)
                .map(DossierMedicalMapper.INSTANCE::toDto)
                .orElse(null); // ✅ null au lieu de throw
    }

    // Mettre à jour un dossier médical
    public DossierMedicalResponse updateDossier(Long id, DossierMedicalRequest request) {
        DossierMedical dossier = dossierMedicalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier médical non trouvé avec l'ID : " + id));

        dossier.setTraitement(request.getTraitement());
        dossier.setAntecedents(request.getAntecedents());
        dossier.setAllergies(request.getAllergies());
        dossier.setNotesMedicales(request.getNotesMedicales());

        DossierMedical updated = dossierMedicalRepository.save(dossier);
        return DossierMedicalMapper.INSTANCE.toDto(updated);
    }

    // 🔹 Supprimer un dossier médical par son ID
    public void deleteDossier(Long id) {
        DossierMedical dossierMedical = dossierMedicalRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Dossier médical non trouvé avec l'ID : " + id)
                );

        Patient patient = dossierMedical.getPatient();

        if (patient != null) {
            // 🔥 casser la relation → orphanRemoval s’active
            patient.setDossierMedical(null);
            patientRepository.save(patient);
        }
    }




    // Récupérer tous les dossiers
    public List<DossierMedicalResponse> getAllDossiers() {
        return DossierMedicalMapper.INSTANCE.toDtoList(dossierMedicalRepository.findAll());
    }
}
