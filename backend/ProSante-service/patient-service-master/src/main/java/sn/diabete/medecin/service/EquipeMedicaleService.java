package sn.diabete.medecin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.medecin.dto.EquipeMedicaleRequest;
import sn.diabete.medecin.dto.EquipeMedicaleResponse;
import sn.diabete.medecin.entity.EquipeMedicale;
import sn.diabete.medecin.entity.Medecin;
import sn.diabete.medecin.exception.ResourceNotFoundException;
import sn.diabete.medecin.mapper.EquipeMedicaleMapper;
import sn.diabete.medecin.repository.EquipeMedicaleRepository;
import sn.diabete.medecin.repository.MedecinRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipeMedicaleService {

    private final EquipeMedicaleRepository equipeRepository;
    private final MedecinRepository medecinRepository;
    private final EquipeMedicaleMapper mapper;

    /* ============================================================
       CRÉATION
       ============================================================ */

    public EquipeMedicaleResponse creerEquipe(EquipeMedicaleRequest request, Long medecinId) {

        if (request.getNom() == null || request.getNom().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom de l'équipe est obligatoire");
        }

        Medecin proprietaire = medecinRepository.findById(medecinId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Médecin introuvable id=" + medecinId));

        EquipeMedicale equipe = new EquipeMedicale();
        equipe.setNom(request.getNom().trim());
        equipe.setMedecinProprietaire(proprietaire);

        // Le propriétaire est automatiquement membre
        equipe.getMedecins().add(proprietaire);

        return mapper.toResponse(equipeRepository.save(equipe));
    }

    /* ============================================================
       AJOUT / RETRAIT DE MÉDECINS
       ============================================================ */

    public EquipeMedicaleResponse ajouterMedecin(
            Long equipeId,
            Long medecinAajouterId,
            Long medecinProprietaireId
    ) {
        EquipeMedicale equipe = getEquipeProprietaire(equipeId, medecinProprietaireId);

        Medecin medecin = medecinRepository.findById(medecinAajouterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Médecin introuvable id=" + medecinAajouterId));

        if (equipe.getMedecins().stream().noneMatch(m -> m.getId().equals(medecin.getId()))) {
            equipe.getMedecins().add(medecin);
        }

        return mapper.toResponse(equipeRepository.save(equipe));
    }

    public EquipeMedicaleResponse retirerMedecin(
            Long equipeId,
            Long medecinAretirerId,
            Long medecinProprietaireId
    ) {
        EquipeMedicale equipe = getEquipeProprietaire(equipeId, medecinProprietaireId);

        // Interdire de retirer le propriétaire
        if (equipe.getMedecinProprietaire().getId().equals(medecinAretirerId)) {
            throw new IllegalStateException("Impossible de retirer le médecin propriétaire");
        }

        boolean removed = equipe.getMedecins()
                .removeIf(m -> m.getId().equals(medecinAretirerId));

        if (!removed) {
            throw new ResourceNotFoundException(
                    "Médecin id=" + medecinAretirerId + " non membre de l'équipe");
        }

        return mapper.toResponse(equipeRepository.save(equipe));
    }

    /* ============================================================
       CONSULTATION
       ============================================================ */

    /** 🔹 Toutes les équipes (admin / debug) */
    public List<EquipeMedicaleResponse> getAll() {
        return equipeRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    /** 🔹 Équipes auxquelles appartient un médecin */
    public List<EquipeMedicaleResponse> getEquipesDuMedecin(Long medecinId) {

        if (!medecinRepository.existsById(medecinId)) {
            throw new ResourceNotFoundException("Médecin introuvable id=" + medecinId);
        }

        return equipeRepository.findByMedecins_Id(medecinId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    /** 🔹 Détail d’une équipe (accessible uniquement aux membres) */
    public EquipeMedicaleResponse getEquipeById(Long equipeId, Long medecinId) {

        EquipeMedicale equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Équipe introuvable id=" + equipeId));

        boolean estMembre = equipe.getMedecins()
                .stream()
                .anyMatch(m -> m.getId().equals(medecinId));

        if (!estMembre) {
            throw new IllegalStateException(
                    "Accès refusé : médecin non membre de l'équipe");
        }

        return mapper.toResponse(equipe);
    }

    /* ============================================================
       MODIFICATION
       ============================================================ */

    public EquipeMedicaleResponse modifierNomEquipe(
            Long equipeId,
            String nouveauNom,
            Long medecinProprietaireId
    ) {
        if (nouveauNom == null || nouveauNom.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom de l'équipe ne peut pas être vide");
        }

        EquipeMedicale equipe = getEquipeProprietaire(equipeId, medecinProprietaireId);

        equipe.setNom(nouveauNom.trim());

        return mapper.toResponse(equipeRepository.save(equipe));
    }

    /* ============================================================
       SUPPRESSION
       ============================================================ */

    public void supprimerEquipe(Long equipeId, Long medecinProprietaireId) {
        EquipeMedicale equipe = getEquipeProprietaire(equipeId, medecinProprietaireId);
        equipeRepository.delete(equipe);
    }

    /* ============================================================
       MÉTHODES PRIVÉES
       ============================================================ */

    private EquipeMedicale getEquipeProprietaire(Long equipeId, Long medecinId) {

        EquipeMedicale equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Équipe introuvable id=" + equipeId));

        if (!equipe.getMedecinProprietaire().getId().equals(medecinId)) {
            throw new IllegalStateException(
                    "Accès refusé : vous n'êtes pas le propriétaire de l'équipe");
        }

        return equipe;
    }
}
