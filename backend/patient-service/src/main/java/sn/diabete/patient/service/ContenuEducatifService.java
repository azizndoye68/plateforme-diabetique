package sn.diabete.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.patient.dto.ContenuEducatifRequest;
import sn.diabete.patient.dto.ContenuEducatifResponse;
import sn.diabete.patient.entity.ContenuEducatif;
import sn.diabete.patient.exception.ResourceNotFoundException;
import sn.diabete.patient.mapper.ContenuEducatifMapper;
import sn.diabete.patient.repository.ContenuEducatifRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContenuEducatifService {

    private final ContenuEducatifRepository contenuRepository;

    // 🔹 Créer un contenu éducatif
    public ContenuEducatifResponse createContenu(ContenuEducatifRequest request) {
        ContenuEducatif contenu = ContenuEducatifMapper.INSTANCE.toEntity(request);
        ContenuEducatif saved = contenuRepository.save(contenu);
        return ContenuEducatifMapper.INSTANCE.toDto(saved);
    }

    // 🔹 Récupérer tous les contenus
    public List<ContenuEducatifResponse> getAllContenus() {
        return ContenuEducatifMapper.INSTANCE.toDtoList(contenuRepository.findAll());
    }

    // 🔹 Récupérer un contenu par ID
    public ContenuEducatifResponse getContenuById(Long id) {
        ContenuEducatif contenu = contenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contenu éducatif non trouvé avec l'ID : " + id));
        return ContenuEducatifMapper.INSTANCE.toDto(contenu);
    }

    // 🔹 Mettre à jour un contenu
    public ContenuEducatifResponse updateContenu(Long id, ContenuEducatifRequest request) {
        ContenuEducatif contenu = contenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contenu éducatif non trouvé avec l'ID : " + id));

        contenu.setTitre(request.getTitre());
        contenu.setType(request.getType());
        contenu.setUrl(request.getUrl());

        ContenuEducatif updated = contenuRepository.save(contenu);
        return ContenuEducatifMapper.INSTANCE.toDto(updated);
    }

    // 🔹 Supprimer un contenu
    public void deleteContenu(Long id) {
        ContenuEducatif contenu = contenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contenu éducatif non trouvé avec l'ID : " + id));
        contenuRepository.delete(contenu);
    }
}
