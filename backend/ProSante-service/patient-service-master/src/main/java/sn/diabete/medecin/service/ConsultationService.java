package sn.diabete.medecin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.medecin.client.PatientClient;
import sn.diabete.medecin.dto.ConsultationRequest;
import sn.diabete.medecin.dto.ConsultationResponse;
import sn.diabete.medecin.entity.Consultation;
import sn.diabete.medecin.entity.Medecin;
import sn.diabete.medecin.exception.ResourceNotFoundException;
import sn.diabete.medecin.mapper.ConsultationMapper;
import sn.diabete.medecin.repository.ConsultationRepository;
import sn.diabete.medecin.repository.MedecinRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final MedecinRepository medecinRepository;
    private final PatientClient patientClient;
    private final ConsultationMapper mapper;

    // ----------------- CREATE -----------------
    public ConsultationResponse creerConsultation(ConsultationRequest request) {

        // 🔹 Vérifier patient
        try {
            patientClient.getPatientById(request.getPatientId());
        } catch (Exception e) {
            throw new ResourceNotFoundException(
                    "Patient introuvable avec l'id : " + request.getPatientId());
        }

        // 🔹 Vérifier médecin
        Medecin medecin = medecinRepository.findById(request.getMedecinId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Médecin introuvable avec l'id : " + request.getMedecinId()));

        Consultation consultation = mapper.toEntity(request);
        consultation.setMedecin(medecin);

        Consultation saved = consultationRepository.save(consultation);
        return mapper.toResponse(saved);
    }

    // ----------------- READ ALL -----------------
    public List<ConsultationResponse> getAllConsultations() {
        return mapper.toResponseList(consultationRepository.findAll());
    }

    // ----------------- READ BY ID -----------------
    public ConsultationResponse getConsultationById(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Consultation introuvable avec l'id : " + id));
        return mapper.toResponse(consultation);
    }

    // ----------------- READ BY MEDECIN -----------------
    public List<ConsultationResponse> getConsultationsByMedecin(Long medecinId) {
        return mapper.toResponseList(
                consultationRepository.findByMedecinId(medecinId));
    }

    // ----------------- READ BY PATIENT -----------------
    public List<ConsultationResponse> getConsultationsByPatient(Long patientId) {
        return mapper.toResponseList(
                consultationRepository.findByPatientId(patientId));
    }

    // ----------------- UPDATE -----------------
    public ConsultationResponse updateConsultation(Long id, ConsultationRequest request) {

        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Consultation introuvable avec l'id : " + id));

        if (request.getMotif() != null)
            consultation.setMotif(request.getMotif());

        if (request.getDiagnostic() != null)
            consultation.setDiagnostic(request.getDiagnostic());

        if (request.getPrescription() != null)
            consultation.setPrescription(request.getPrescription());

        if (request.getMedecinId() != null) {
            Medecin medecin = medecinRepository.findById(request.getMedecinId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Médecin introuvable avec l'id : " + request.getMedecinId()));
            consultation.setMedecin(medecin);
        }

        Consultation updated = consultationRepository.save(consultation);
        return mapper.toResponse(updated);
    }

    // ----------------- DELETE -----------------
    public void deleteConsultation(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Consultation introuvable avec l'id : " + id));
        consultationRepository.delete(consultation);
    }
}
