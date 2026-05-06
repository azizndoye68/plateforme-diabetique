package sn.diabete.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import sn.diabete.notification.entity.NotificationHistory;
import sn.diabete.notification.enums.CanalNotification;
import sn.diabete.notification.enums.StatutNotification;
import sn.diabete.notification.enums.TypeAlerte;
import sn.diabete.notification.repository.NotificationHistoryRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final NotificationHistoryRepository historyRepository;

    public void sendEmail(String destinataire, String sujet, String message,
                          Long patientId, Long medecinId, TypeAlerte typeAlerte, Long glycemieId) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(destinataire);
            mailMessage.setSubject(sujet);
            mailMessage.setText(message);
            mailMessage.setFrom("noreply@suividiabete.sn");

            mailSender.send(mailMessage);

            saveHistory(destinataire, message, patientId, medecinId,
                    typeAlerte, glycemieId, StatutNotification.ENVOYE);

            log.info("✅ Email envoyé avec succès à {}", destinataire);

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'email à {}: {}", destinataire, e.getMessage());

            saveHistory(destinataire, message, patientId, medecinId,
                    typeAlerte, glycemieId, StatutNotification.ECHEC);
        }
    }

    private void saveHistory(String destinataire, String message, Long patientId,
                             Long medecinId, TypeAlerte typeAlerte, Long glycemieId,
                             StatutNotification statut) {
        NotificationHistory history = new NotificationHistory();
        history.setPatientId(patientId);
        history.setMedecinId(medecinId);
        history.setTypeAlerte(typeAlerte);
        history.setCanal(CanalNotification.EMAIL);
        history.setStatut(statut);
        history.setMessage(message);
        history.setDestinataire(destinataire);
        history.setGlycemieId(glycemieId);

        historyRepository.save(history);
    }
}
