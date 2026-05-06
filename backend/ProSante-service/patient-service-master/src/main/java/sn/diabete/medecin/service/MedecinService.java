package sn.diabete.medecin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.medecin.client.PatientClient;
import sn.diabete.medecin.dto.MedecinRequest;
import sn.diabete.medecin.dto.MedecinResponse;
import sn.diabete.medecin.dto.PatientDTO;
import sn.diabete.medecin.entity.Medecin;
import sn.diabete.medecin.exception.BadRequestException;
import sn.diabete.medecin.exception.ResourceNotFoundException;
import sn.diabete.medecin.mapper.MedecinMapper;
import sn.diabete.medecin.repository.MedecinRepository;

import sn.diabete.medecin.dto.EquipeMedicaleDTO;
import sn.diabete.medecin.dto.MembreEquipeDTO;
import sn.diabete.medecin.entity.EquipeMedicale;
import sn.diabete.medecin.repository.EquipeMedicaleRepository;
import java.util.Optional;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedecinService {

    private final MedecinRepository medecinRepository;
    private final PatientClient patientClient;
    // 🆕 AJOUTER cette ligne
    private final EquipeMedicaleRepository equipeRepository;

    // 🔹 Créer un médecin
    public MedecinResponse createMedecin(MedecinRequest request) {
        System.out.println("Utilisateur ID reçu : " + request.getUtilisateurId());
        if (request.getUtilisateurId() == null) {
            throw new BadRequestException("UtilisateurId est obligatoire pour créer un médecin");
        }

        if (medecinRepository.existsByTelephone(request.getTelephone())) {
            throw new BadRequestException("Le téléphone " + request.getTelephone() + " est déjà utilisé.");
        }

        // Mapper les données
        Medecin medecin = MedecinMapper.INSTANCE.toEntity(request);
        medecin.setUtilisateurId(request.getUtilisateurId());

        // Générer numéro professionnel unique
        String numeroProfessionnel = generateNumeroProfessionnel();
        medecin.setNumeroProfessionnel(numeroProfessionnel);

        Medecin savedMedecin = medecinRepository.save(medecin);
        return MedecinMapper.INSTANCE.toDto(savedMedecin);
    }


    private String generateNumeroProfessionnel() {
        String year = String.valueOf(LocalDate.now().getYear()).substring(2); // "25"
        String suffix = UUID.randomUUID().toString().substring(0, 3).toUpperCase(); // 3 caractères uniques
        return "MED" + year + suffix; // Ex: MED25A1F
    }


    // 🔹 Récupérer tous les médecins
    public List<MedecinResponse> getAllMedecins() {
        List<Medecin> medecins = medecinRepository.findAll();
        return MedecinMapper.INSTANCE.toDtoList(medecins);
    }

    // 🔹 Récupérer un médecin par ID
    public MedecinResponse getMedecinById(Long id) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé avec l'ID : " + id));
        return MedecinMapper.INSTANCE.toDto(medecin);
    }

    // 🔹 Récupérer un médecin par utilisateurId (important pour login)
    public MedecinResponse getMedecinByUtilisateurId(Long utilisateurId) {
        Medecin medecin = medecinRepository.findByUtilisateurId(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Médecin non trouvé pour utilisateurId : " + utilisateurId));
        return MedecinMapper.INSTANCE.toDto(medecin);
    }

    // 🔹 Mettre à jour un médecin
    public MedecinResponse updateMedecin(Long id, MedecinRequest request) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé avec l'ID : " + id));

        if (!medecin.getTelephone().equals(request.getTelephone()) &&
                medecinRepository.existsByTelephone(request.getTelephone())) {
            throw new BadRequestException("Le téléphone " + request.getTelephone() + " est déjà utilisé.");
        }

        medecin.setNom(request.getNom());
        medecin.setPrenom(request.getPrenom());
        medecin.setTelephone(request.getTelephone());
        medecin.setSpecialite(request.getSpecialite());
        medecin.setNomService(request.getNomService());
        medecin.setAdresse(request.getAdresse());
        medecin.setVille(request.getVille());
        medecin.setRegion(request.getRegion());

        // ✅ Ne mettre à jour que si la valeur est fournie
        if (request.getDateNaissance() != null) {
            medecin.setDateNaissance(request.getDateNaissance());
        }
        if (request.getSexe() != null) {
            medecin.setSexe(request.getSexe());
        }

        Medecin updatedMedecin = medecinRepository.save(medecin);
        return MedecinMapper.INSTANCE.toDto(updatedMedecin);
    }
    // 🔹 Supprimer un médecin
    public void deleteMedecin(Long id) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé avec l'ID : " + id));
        medecinRepository.delete(medecin);
    }

    // 🔹 Récupérer un médecin par son numéro professionnel
    public MedecinResponse getMedecinByNumeroProfessionnel(String numeroProfessionnel) {
        Medecin medecin = medecinRepository.findByNumeroProfessionnel(numeroProfessionnel)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Médecin introuvable avec le numéro professionnel : " + numeroProfessionnel));
        return MedecinMapper.INSTANCE.toDto(medecin);
    }

    public List<PatientDTO> getPatients() {

        return patientClient.getAllPatients();
    }

/* ============================================================
   MÉTHODES POUR COMMUNICATION-SERVICE
   ============================================================ */

    /**
     * 🔹 Vérifier si un médecin existe
     */
    public boolean medecinExists(Long id) {
        return medecinRepository.existsById(id);
    }

    /**
     * 🔹 Récupérer l'équipe médicale d'un médecin (pour communication-service)
     */
    public EquipeMedicaleDTO getEquipeMedicale(Long medecinId) {
        Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé : " + medecinId));

        // Récupérer l'équipe dont le médecin est propriétaire
        List<EquipeMedicale> equipesCreees = equipeRepository.findByMedecinProprietaireId(medecinId);

        if (equipesCreees.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Ce médecin n'a pas d'équipe médicale. ID médecin : " + medecinId
            );
        }

        // Prendre la première équipe (un médecin ne devrait avoir qu'une équipe en tant que propriétaire)
        EquipeMedicale equipe = equipesCreees.get(0);

        // Mapper les membres de l'équipe (exclure le propriétaire)
        List<MembreEquipeDTO> membres = equipe.getMedecins().stream()
                .filter(m -> !m.getId().equals(medecinId)) // Exclure le propriétaire
                .map(m -> MembreEquipeDTO.builder()
                        .id(m.getId())
                        .nom(m.getNom())
                        .prenom(m.getPrenom())
                        .specialite(m.getSpecialite())
                        .build())
                .collect(Collectors.toList());

        return EquipeMedicaleDTO.builder()
                .equipeMedicaleId(equipe.getId())
                .proprietaireId(medecin.getId())
                .membres(membres)
                .build();
    }

    /**
     * 🔹 Vérifier si un médecin peut accéder aux données d'un patient
     */
    public boolean canAccessPatient(Long medecinId, Long patientId) {
        try {
            // 1. Récupérer les infos du patient via Feign Client
            PatientDTO patient = patientClient.getPatientById(patientId);

            // 2. Vérifier si c'est le médecin référent direct
            if (patient.getMedecinId() != null && patient.getMedecinId().equals(medecinId)) {
                return true;
            }

            // 3. Vérifier si le médecin fait partie de l'équipe du médecin référent
            if (patient.getMedecinId() != null) {
                Medecin medecinReferent = medecinRepository.findById(patient.getMedecinId())
                        .orElse(null);

                if (medecinReferent != null) {
                    // Chercher l'équipe du médecin référent
                    List<EquipeMedicale> equipesReferent = equipeRepository.findByMedecinProprietaireId(
                            patient.getMedecinId()
                    );

                    if (!equipesReferent.isEmpty()) {
                        EquipeMedicale equipe = equipesReferent.get(0);
                        // Vérifier si le médecin fait partie de cette équipe
                        return equipe.getMedecins().stream()
                                .anyMatch(m -> m.getId().equals(medecinId));
                    }
                }
            }

            return false;

        } catch (Exception e) {
            // En cas d'erreur (patient non trouvé, service indisponible, etc.)
            return false;
        }
    }

}
