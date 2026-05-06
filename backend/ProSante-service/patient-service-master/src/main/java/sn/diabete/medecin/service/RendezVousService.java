package sn.diabete.medecin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.medecin.client.PatientClient;
import sn.diabete.medecin.dto.RendezVousRequest;
import sn.diabete.medecin.dto.RendezVousResponse;
import sn.diabete.medecin.entity.Medecin;
import sn.diabete.medecin.entity.RendezVous;
import sn.diabete.medecin.entity.StatutRendezVous;
import sn.diabete.medecin.event.RendezVousEvent;
import sn.diabete.medecin.exception.ResourceNotFoundException;
import sn.diabete.medecin.mapper.RendezVousMapper;
import sn.diabete.medecin.messaging.RendezVousEventPublisher;
import sn.diabete.medecin.repository.MedecinRepository;
import sn.diabete.medecin.repository.RendezVousRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final MedecinRepository medecinRepository;
    private final PatientClient patientClient;
    private final RendezVousMapper mapper;
    private final RendezVousEventPublisher eventPublisher; // 🆕

    public RendezVousResponse creerRendezVous(RendezVousRequest request) {
        try {
            patientClient.getPatientById(request.getPatientId());
        } catch (Exception e) {
            throw new ResourceNotFoundException("Patient introuvable avec l'id : " + request.getPatientId());
        }

        Medecin medecin = medecinRepository.findById(request.getMedecinId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Médecin introuvable avec l'id : " + request.getMedecinId()));

        RendezVous rdv = mapper.toEntity(request);
        rdv.setMedecin(medecin);

        if (rdv.getStatut() == null) {
            rdv.setStatut(StatutRendezVous.PLANIFIE);
        }

        RendezVous saved = rendezVousRepository.save(rdv);

        // 🆕 Publier l'événement
        eventPublisher.publishEvent(buildEvent(saved, "PLANIFIE"));

        return mapper.toResponse(saved);
    }

    public RendezVousResponse updateStatut(Long id, StatutRendezVous statut) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rendez-vous introuvable avec l'id : " + id));
        rdv.setStatut(statut);
        RendezVous saved = rendezVousRepository.save(rdv);

        // 🆕 Publier uniquement pour CONFIRME et ANNULE
        if (statut == StatutRendezVous.CONFIRME || statut == StatutRendezVous.ANNULE) {
            eventPublisher.publishEvent(buildEvent(saved, statut.name()));
        }

        return mapper.toResponse(saved);
    }

    public RendezVousResponse updateRendezVous(Long id, RendezVousRequest request) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rendez-vous introuvable avec l'id : " + id));

        boolean dateChangee = request.getDateRdv() != null
                && !request.getDateRdv().equals(rdv.getDateRdv());

        if (request.getDateRdv() != null) rdv.setDateRdv(request.getDateRdv());
        if (request.getMotif() != null) rdv.setMotif(request.getMotif());
        if (request.getStatut() != null) rdv.setStatut(request.getStatut());

        if (request.getMedecinId() != null) {
            Medecin medecin = medecinRepository.findById(request.getMedecinId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Médecin introuvable avec l'id : " + request.getMedecinId()));
            rdv.setMedecin(medecin);
        }

        RendezVous saved = rendezVousRepository.save(rdv);

        // 🆕 Notifier si la date a changé (replanification)
        if (dateChangee) {
            eventPublisher.publishEvent(buildEvent(saved, "PLANIFIE"));
        }

        return mapper.toResponse(saved);
    }

    // Les méthodes de lecture restent identiques
    public List<RendezVousResponse> getRendezVousByPatient(Long patientId) {
        return mapper.toResponseList(rendezVousRepository.findByPatientId(patientId));
    }

    public List<RendezVousResponse> getRendezVousByMedecin(Long medecinId) {
        return mapper.toResponseList(rendezVousRepository.findByMedecinId(medecinId));
    }

    public List<RendezVousResponse> getAllRendezVous() {
        return mapper.toResponseList(rendezVousRepository.findAll());
    }

    public void deleteRendezVous(Long id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rendez-vous introuvable avec l'id : " + id));
        rendezVousRepository.delete(rdv);
    }

    // 🆕 Builder d'événement centralisé
    private RendezVousEvent buildEvent(RendezVous rdv, String typeEvenement) {
        return RendezVousEvent.builder()
                .rendezVousId(rdv.getId())
                .patientId(rdv.getPatientId())
                .medecinId(rdv.getMedecin().getId())
                .medecinUtilisateurId(rdv.getMedecin().getUtilisateurId()) // 🆕
                .medecinNom(rdv.getMedecin().getNom())
                .medecinPrenom(rdv.getMedecin().getPrenom())
                .dateRdv(rdv.getDateRdv())
                .motif(rdv.getMotif())
                .statut(rdv.getStatut())
                .typeEvenement(typeEvenement)
                .build();
    }
}