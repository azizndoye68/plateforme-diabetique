package sn.diabete.notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.notification.dto.NotificationPreferenceRequest;
import sn.diabete.notification.dto.NotificationPreferenceResponse;
import sn.diabete.notification.service.NotificationPreferenceService;

@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    @PostMapping
    public ResponseEntity<NotificationPreferenceResponse> createOrUpdatePreference(
            @RequestBody NotificationPreferenceRequest request) {
        NotificationPreferenceResponse response = preferenceService.createOrUpdatePreference(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<NotificationPreferenceResponse> getPreferenceByPatientId(
            @PathVariable Long patientId) {
        NotificationPreferenceResponse response = preferenceService.getPreferenceByPatientId(patientId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/patient/{patientId}")
    public ResponseEntity<Void> deletePreference(@PathVariable Long patientId) {
        preferenceService.deletePreference(patientId);
        return ResponseEntity.noContent().build();
    }
}