package sn.diabete.notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.diabete.notification.entity.NotificationHistory;
import sn.diabete.notification.enums.StatutNotification;
import sn.diabete.notification.repository.NotificationHistoryRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notification-history")
@RequiredArgsConstructor
@Slf4j  // 🆕
public class NotificationHistoryController {

    private final NotificationHistoryRepository historyRepository;

    // ======================================================
    // PATIENT — uniquement ses propres notifications (medecinId IS NULL)
    // ======================================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<NotificationHistory>> getHistoryByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(
                historyRepository.findByPatientIdAndMedecinIdIsNullOrderByDateEnvoiDesc(patientId)
        );
    }

    @GetMapping("/patient/{patientId}/non-lues/count")
    public ResponseEntity<Map<String, Long>> countNonLuesPatient(
            @PathVariable Long patientId) {
        Long count = historyRepository.countByPatientIdAndMedecinIdIsNullAndStatut(
                patientId, StatutNotification.ENVOYE);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/patient/{patientId}/mark-all-read")
    public ResponseEntity<Void> markAllReadPatient(@PathVariable Long patientId) {
        List<NotificationHistory> notifs = historyRepository
                .findByPatientIdAndMedecinIdIsNullAndStatut(patientId, StatutNotification.ENVOYE);
        notifs.forEach(n -> {
            n.setStatut(StatutNotification.LU);
            n.setDateLecture(LocalDateTime.now());
        });
        historyRepository.saveAll(notifs);
        return ResponseEntity.ok().build();
    }

    // ======================================================
    // MEDECIN — ses notifications (medecinId non null)
    // ======================================================

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<NotificationHistory>> getHistoryByMedecin(
            @PathVariable Long medecinId) {
        return ResponseEntity.ok(
                historyRepository.findByMedecinIdOrderByDateEnvoiDesc(medecinId)
        );
    }

    @GetMapping("/medecin/{medecinId}/non-lues/count")
    public ResponseEntity<Map<String, Long>> countNonLuesMedecin(
            @PathVariable Long medecinId) {
        Long count = historyRepository.countByMedecinIdAndStatut(
                medecinId, StatutNotification.ENVOYE);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/medecin/{medecinId}/mark-all-read")
    public ResponseEntity<Void> markAllReadMedecin(@PathVariable Long medecinId) {
        List<NotificationHistory> notifs = historyRepository
                .findByMedecinIdAndStatut(medecinId, StatutNotification.ENVOYE);
        notifs.forEach(n -> {
            n.setStatut(StatutNotification.LU);
            n.setDateLecture(LocalDateTime.now());
        });
        historyRepository.saveAll(notifs);
        return ResponseEntity.ok().build();
    }

    // ======================================================
    // COMMUN
    // ======================================================

    @GetMapping
    public ResponseEntity<List<NotificationHistory>> getAllHistory() {
        return ResponseEntity.ok(historyRepository.findAll());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        NotificationHistory notification = historyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notification.setStatut(StatutNotification.LU);
        notification.setDateLecture(LocalDateTime.now());
        historyRepository.save(notification);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/medecin/{medecinId}/patient/{patientId}")
    public ResponseEntity<List<NotificationHistory>> getHistoryByMedecinAndPatient(
            @PathVariable Long medecinId,
            @PathVariable Long patientId) {
        log.info("📋 Récupération notifs médecin {} pour patient {}", medecinId, patientId);
        List<NotificationHistory> history = historyRepository
                .findByMedecinIdAndPatientIdOrderByDateEnvoiDesc(medecinId, patientId);
        log.info("📋 {} notifications trouvées", history.size());
        return ResponseEntity.ok(history);
    }
}