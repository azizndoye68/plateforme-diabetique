package sn.diabete.notification.enums;

public enum StatutNotification {
    ENVOYE("Envoyé avec succès"),
    ECHEC("Échec d'envoi"),
    EN_ATTENTE("En attente"),
    LU("Lu par le destinataire");

    private final String libelle;

    StatutNotification(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() { return libelle; }
}