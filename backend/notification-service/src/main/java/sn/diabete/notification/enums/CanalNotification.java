package sn.diabete.notification.enums;

public enum CanalNotification {
    EMAIL("Email"),
    SMS("SMS"),
    PUSH("Notification Push");

    private final String libelle;

    CanalNotification(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() { return libelle; }
}