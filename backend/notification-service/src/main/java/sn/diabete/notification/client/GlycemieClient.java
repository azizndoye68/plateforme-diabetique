package sn.diabete.notification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;

@FeignClient(name = "suivi-medical-service")
public interface GlycemieClient {

    @GetMapping("/api/suivis/patient/{patientId}/last-date")
    LocalDateTime getLastMeasurementDate(@PathVariable("patientId") Long patientId);
}