package sn.diabete.notification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import sn.diabete.notification.dto.MedecinDTO;

/**
 * Client Feign pour communiquer avec medecin-service
 */
@FeignClient(name = "medecin-service")
public interface MedecinClient {

    /**
     * Récupère les informations d'un médecin par son ID
     * @param id ID du médecin
     * @return Informations du médecin
     */
    @GetMapping("/api/medecins/{id}")
    MedecinDTO getMedecinById(@PathVariable("id") Long id);
}