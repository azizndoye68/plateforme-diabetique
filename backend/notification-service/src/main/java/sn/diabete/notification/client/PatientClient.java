package sn.diabete.notification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import sn.diabete.notification.dto.PatientDTO;

import java.util.List;

@FeignClient(name = "patient-service")
public interface PatientClient {

    @GetMapping("/api/patients")
    List<PatientDTO> getAllPatients();

    @GetMapping("/api/patients/{id}")
    PatientDTO getPatientById(@PathVariable("id") Long id);
}
