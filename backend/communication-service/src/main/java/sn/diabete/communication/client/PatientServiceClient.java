package sn.diabete.communication.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import sn.diabete.communication.dto.PatientInfoDTO;

@FeignClient(
        name = "patient-service",
        url = "${microservices.patient-service.url}"
)
public interface PatientServiceClient {

    @GetMapping("/api/patients/{id}")
    PatientInfoDTO getPatientById(@PathVariable("id") Long id);

    @GetMapping("/api/patients/{id}/exists")
    Boolean patientExists(@PathVariable("id") Long id);
}