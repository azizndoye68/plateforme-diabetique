package sn.diabete.communication.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import sn.diabete.communication.dto.EquipeMedicaleDTO;
import sn.diabete.communication.dto.MedecinInfoDTO;

@FeignClient(
        name = "medecin-service",
        url = "${microservices.medecin-service.url}"
)
public interface MedecinServiceClient {

    @GetMapping("/api/medecins/{id}")
    MedecinInfoDTO getMedecinById(@PathVariable("id") Long id);

    @GetMapping("/api/medecins/byUtilisateur/{utilisateurId}")
    MedecinInfoDTO getMedecinByUtilisateurId(@PathVariable("utilisateurId") Long userId);

    @GetMapping("/api/medecins/{medecinId}/equipe")
    EquipeMedicaleDTO getEquipeMedicale(@PathVariable("medecinId") Long medecinId);

    @GetMapping("/api/medecins/{medecinId}/can-access-patient/{patientId}")
    CanAccessInfo canAccessPatient(
            @PathVariable("medecinId") Long medecinId,
            @PathVariable("patientId") Long patientId
    );

    @lombok.Data
    class CanAccessInfo { private boolean canAccess; }

    @GetMapping("/api/medecins/{id}/exists")
    Boolean medecinExists(@PathVariable("id") Long id);
}
