package sn.diabete.patient.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import sn.diabete.patient.dto.EquipeMedecinInfo;
import sn.diabete.patient.dto.MedecinInfo;

import java.util.List;

@FeignClient(name = "medecin-service")
public interface MedecinServiceClient {
    @GetMapping("/api/medecins/numero/{numeroProfessionnel}")
    MedecinInfo getByNumeroProfessionnel(@PathVariable("numeroProfessionnel") String numeroProfessionnel);

    @GetMapping("/api/medecins/{id}")
    MedecinInfo getById(@PathVariable("id") Long id);

    @GetMapping("/api/equipes-medicales/medecin/{medecinId}")
    List<EquipeMedecinInfo> getEquipesDuMedecin(@PathVariable("medecinId") Long medecinId);
}
