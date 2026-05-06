package sn.diabete.notification.service;

import sn.diabete.notification.enums.TypeAlerte;

public interface NotificationService {

    void sendEmail(String destinataire, String sujet, String message,
                   Long patientId, Long medecinId, TypeAlerte typeAlerte, Long glycemieId);

    void sendSms(String numeroTelephone, String message,
                 Long patientId, Long medecinId, TypeAlerte typeAlerte, Long glycemieId);
}