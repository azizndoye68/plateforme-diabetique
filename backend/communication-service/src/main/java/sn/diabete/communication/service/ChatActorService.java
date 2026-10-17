package sn.diabete.communication.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.diabete.communication.client.MedecinServiceClient;
import sn.diabete.communication.client.PatientServiceClient;
import sn.diabete.communication.entity.SenderType;
import sn.diabete.communication.security.ChatPrincipal;

@Service
@RequiredArgsConstructor
public class ChatActorService {
    private final PatientServiceClient patientClient;
    private final MedecinServiceClient medecinClient;

    public Actor resolve(java.security.Principal authenticated) {
        ChatPrincipal principal = authenticated instanceof org.springframework.security.core.Authentication auth
                && auth.getPrincipal() instanceof ChatPrincipal chatPrincipal ? chatPrincipal
                : authenticated instanceof ChatPrincipal chatPrincipal ? chatPrincipal : null;
        if (principal == null) throw new SecurityException("Authentification requise");
        if ("PATIENT".equalsIgnoreCase(principal.role())) {
            return new Actor(patientClient.getPatientByUtilisateurId(principal.userId()).getId(), SenderType.PATIENT);
        }
        if ("MEDECIN".equalsIgnoreCase(principal.role()) || "INFIRMIER".equalsIgnoreCase(principal.role())) {
            return new Actor(medecinClient.getMedecinByUtilisateurId(principal.userId()).getId(), SenderType.MEDECIN);
        }
        throw new SecurityException("Rôle non autorisé pour la messagerie");
    }

    public record Actor(Long profileId, SenderType type) { }
}
