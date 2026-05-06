package sn.diabete.notification.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sn.diabete.notification.config.TwilioConfig;
import sn.diabete.notification.entity.NotificationHistory;
import sn.diabete.notification.enums.CanalNotification;
import sn.diabete.notification.enums.StatutNotification;
import sn.diabete.notification.enums.TypeAlerte;
import sn.diabete.notification.repository.NotificationHistoryRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsNotificationService {

    private final TwilioConfig twilioConfig;
    private final NotificationHistoryRepository historyRepository;

    @PostConstruct
    public void init() {
        try {
            Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());
            log.info("✅ Twilio initialisé avec succès");
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'initialisation de Twilio: {}", e.getMessage());
        }
    }

    public void sendSms(String numeroTelephone, String messageText,
                        Long patientId, Long medecinId, TypeAlerte typeAlerte, Long glycemieId) {
        try {
            String smsMessage = messageText.length() > 160
                    ? messageText.substring(0, 157) + "..."
                    : messageText;

            Message message = Message.creator(
                    new PhoneNumber(numeroTelephone),
                    new PhoneNumber(twilioConfig.getPhoneNumber()),
                    smsMessage
            ).create();

            saveHistory(numeroTelephone, smsMessage, patientId, medecinId,
                    typeAlerte, glycemieId, StatutNotification.ENVOYE);

            log.info("✅ SMS envoyé avec succès à {} - SID: {}", numeroTelephone, message.getSid());

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi du SMS à {}: {}", numeroTelephone, e.getMessage());

            saveHistory(numeroTelephone, messageText, patientId, medecinId,
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
        history.setCanal(CanalNotification.SMS);
        history.setStatut(statut);
        history.setMessage(message);
        history.setDestinataire(destinataire);
        history.setGlycemieId(glycemieId);

        historyRepository.save(history);
    }
}
