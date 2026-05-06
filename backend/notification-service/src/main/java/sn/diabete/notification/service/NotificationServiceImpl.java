package sn.diabete.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.notification.enums.TypeAlerte;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final EmailNotificationService emailService;
    private final SmsNotificationService smsService;

    @Override
    public void sendEmail(String destinataire, String sujet, String message,
                          Long patientId, Long medecinId, TypeAlerte typeAlerte, Long glycemieId) {
        emailService.sendEmail(destinataire, sujet, message, patientId, medecinId, typeAlerte, glycemieId);
    }

    @Override
    public void sendSms(String numeroTelephone, String message,
                        Long patientId, Long medecinId, TypeAlerte typeAlerte, Long glycemieId) {
        smsService.sendSms(numeroTelephone, message, patientId, medecinId, typeAlerte, glycemieId);
    }
}