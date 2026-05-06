package sn.diabete.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import sn.diabete.patient.dto.PatientRequest;
import sn.diabete.patient.dto.PatientResponse;
import sn.diabete.patient.entity.Patient;
import sn.diabete.patient.exception.BadRequestException;
import sn.diabete.patient.exception.ResourceNotFoundException;
import sn.diabete.patient.mapper.PatientMapper;
import sn.diabete.patient.repository.PatientRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    private final RestTemplate restTemplate = new RestTemplate(); // 🔹 pour appeler MedecinService

    // ✅ Ajouter un patient (le code médecin devient facultatif)
    public PatientResponse createPatient(PatientRequest request) {
        System.out.println("Utilisateur ID reçu pour Patient : " + request.getUtilisateurId());

        if (request.getUtilisateurId() == null) {
            throw new BadRequestException("UtilisateurId est obligatoire pour créer un patient");
        }

        if (patientRepository.findByUtilisateurId(request.getUtilisateurId()).isPresent()) {
            throw new BadRequestException("Un patient existe déjà avec cet utilisateurId : " + request.getUtilisateurId());
        }

        if (patientRepository.existsByTelephone(request.getTelephone())) {
            throw new BadRequestException("Le téléphone " + request.getTelephone() + " est déjà utilisé.");
        }

        // ⭐ Le code médecin devient optionnel
        if (request.getNumeroProfessionnelMedecin() != null
                && !request.getNumeroProfessionnelMedecin().isEmpty()) {

            try {
                String medecinUrl = "http://localhost:8084/api/medecins/numero/" + request.getNumeroProfessionnelMedecin();
                Map<?, ?> medecinDto = restTemplate.getForObject(medecinUrl, Map.class);

                if (medecinDto == null || medecinDto.get("id") == null) {
                    throw new BadRequestException("Médecin introuvable avec ce numéro professionnel");
                }

                // 🔹 On récupère l'ID du médecin pour lier au patient
                request.setMedecinId(Long.valueOf(String.valueOf(medecinDto.get("id"))));

            } catch (Exception ex) {
                throw new BadRequestException("Erreur lors de la vérification du médecin : " + ex.getMessage());
            }
        } else {
            // ⭐ Aucun code fourni -> aucune erreur, on continue l'inscription
            request.setMedecinId(null);
        }

        Patient patient = PatientMapper.INSTANCE.toEntity(request);
        patient.setUtilisateurId(request.getUtilisateurId());
        patient.setNumeroDossier(generateNumeroDossier());

        Patient savedPatient = patientRepository.save(patient);
        return PatientMapper.INSTANCE.toDto(savedPatient);
    }


    // 🧠 Générer un numéro de dossier unique comme "PAT-20250930-AB12"
    private String generateNumeroDossier() {
        String date = LocalDate.now().toString().replace("-", "");
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "PAT-" + date + "-" + suffix;
    }
    // ✅ Récupérer tous les patients
    public List<PatientResponse> getAllPatients() {
        return PatientMapper.INSTANCE.toDtoList(patientRepository.findAll());
    }

    // ✅ Récupérer un patient par ID
    public PatientResponse getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID : " + id));
        return PatientMapper.INSTANCE.toDto(patient);
    }

    // ✅ Récupérer un patient par utilisateurId (lié à AuthService)
    public PatientResponse getPatientByUtilisateurId(Long utilisateurId) {
        Patient patient = patientRepository.findByUtilisateurId(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun patient trouvé avec l'utilisateurId : " + utilisateurId));
        return PatientMapper.INSTANCE.toDto(patient);
    }

    // ✅ Mettre à jour un patient
    public PatientResponse updatePatient(Long id, PatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID : " + id));

        if (!patient.getTelephone().equals(request.getTelephone())
                && patientRepository.existsByTelephone(request.getTelephone())) {
            throw new BadRequestException("Le téléphone " + request.getTelephone() + " est déjà utilisé.");
        }

        patient.setNom(request.getNom());
        patient.setPrenom(request.getPrenom());
        patient.setDateNaissance(request.getDateNaissance());
        patient.setSexe(request.getSexe());
        patient.setTypeDiabete(request.getTypeDiabete());
        //patient.setTraitement(request.getTraitement());
        patient.setTelephone(request.getTelephone());
        patient.setAdresse(request.getAdresse());
        patient.setVille(request.getVille());
        patient.setRegion(request.getRegion());

        Patient updatedPatient = patientRepository.save(patient);
        return PatientMapper.INSTANCE.toDto(updatedPatient);
    }

    // ✅ Supprimer un patient
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID : " + id));
        patientRepository.delete(patient);
    }

    // ✅ Rattacher un médecin à un patient après l'inscription
    public PatientResponse rattacherMedecin(Long patientId, String numeroProfessionnelMedecin) {

        // Vérifier que le patient existe
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID : " + patientId));

        if (numeroProfessionnelMedecin == null || numeroProfessionnelMedecin.isEmpty()) {
            throw new BadRequestException("Le numéro professionnel du médecin est obligatoire");
        }

        try {
            // 🔹 Appel au microservice Médecin
            String medecinUrl = "http://localhost:8084/api/medecins/numero/" + numeroProfessionnelMedecin;
            Map<?, ?> medecinDto = restTemplate.getForObject(medecinUrl, Map.class);

            if (medecinDto == null || medecinDto.get("id") == null) {
                throw new BadRequestException("Médecin introuvable avec ce numéro professionnel");
            }

            // 🔹 Liaison du patient au médecin
            Long medecinId = Long.valueOf(String.valueOf(medecinDto.get("id")));
            patient.setMedecinId(medecinId);

        } catch (Exception ex) {
            throw new BadRequestException("Impossible de trouver le médecin : " + ex.getMessage());
        }

        // 🔹 Sauvegarde
        Patient updated = patientRepository.save(patient);

        return PatientMapper.INSTANCE.toDto(updated);
    }

    // ✅ Lister les patients d’un médecin
    public List<PatientResponse> getPatientsByMedecinId(Long medecinId) {

        if (medecinId == null) {
            throw new BadRequestException("L'identifiant du médecin est obligatoire");
        }

        List<Patient> patients = patientRepository.findByMedecinId(medecinId);

        if (patients.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Aucun patient trouvé pour le médecin avec l'ID : " + medecinId
            );
        }

        return PatientMapper.INSTANCE.toDtoList(patients);
    }

    public List<PatientResponse> getPatientsDuMedecinByMedecinId(Long medecinId) {

        if (medecinId == null) {
            throw new BadRequestException("L'id du médecin est obligatoire");
        }

        try {
            // 🔹 Vérifier que le médecin existe (appel inter-microservice)
            String medecinUrl = "http://localhost:8084/api/medecins/" + medecinId;
            Map<?, ?> medecinDto = restTemplate.getForObject(medecinUrl, Map.class);

            if (medecinDto == null || medecinDto.get("id") == null) {
                throw new BadRequestException("Médecin introuvable avec l'id : " + medecinId);
            }

        } catch (Exception ex) {
            throw new BadRequestException(
                    "Erreur lors de la vérification du médecin : " + ex.getMessage()
            );
        }

        // 🔹 Récupération des patients liés à ce médecin
        List<Patient> patients = patientRepository.findByMedecinId(medecinId);

        return PatientMapper.INSTANCE.toDtoList(patients);
    }


    // ✅ Patients visibles par un médecin
    public List<PatientResponse> getPatientsVisiblesPourMedecin(Long medecinId) {

        if (medecinId == null) {
            throw new BadRequestException("L'id du médecin est obligatoire");
        }

        // 1️⃣ Patients dont le médecin est référent
        List<Patient> patientsDirects =
                patientRepository.findByMedecinId(medecinId);

        // 2️⃣ Récupérer les équipes du médecin (medecin-service)
        String equipesUrl =
                "http://localhost:8084/api/equipes-medicales/medecin/" + medecinId;

        List<Map<String, Object>> equipes;
        try {
            equipes = restTemplate.getForObject(equipesUrl, List.class);
        } catch (Exception ex) {
            throw new BadRequestException(
                    "Erreur lors de la récupération des équipes du médecin : " + ex.getMessage()
            );
        }

        // 3️⃣ Récupérer les IDs des médecins propriétaires
        List<Long> proprietairesIds = equipes == null ? List.of() :
                equipes.stream()
                        .map(e -> e.get("medecinProprietaireId"))
                        .filter(id -> id != null)
                        .map(id -> Long.valueOf(String.valueOf(id)))
                        .filter(id -> !id.equals(medecinId))
                        .distinct()
                        .toList();

        // 4️⃣ Patients des médecins propriétaires
        List<Patient> patientsProprietaires =
                proprietairesIds.isEmpty()
                        ? List.of()
                        : patientRepository.findByMedecinIdIn(proprietairesIds);

        // 5️⃣ Fusion sans doublons
        Map<Long, Patient> patientsUniques = new java.util.HashMap<>();

        for (Patient p : patientsDirects) {
            patientsUniques.put(p.getId(), p);
        }

        for (Patient p : patientsProprietaires) {
            patientsUniques.put(p.getId(), p);
        }

        return PatientMapper.INSTANCE.toDtoList(
                patientsUniques.values().stream().toList()
        );
    }


    /**
     * 🔹 Vérifier si un patient existe (pour communication-service)
     */
    public boolean patientExists(Long id) {
        return patientRepository.existsById(id);
    }

}
