package sn.diabete.notification.enums;

public enum NiveauAlerte {
    NORMAL("Normal", "Glycémie dans la plage normale"),
    ATTENTION("Attention", "Glycémie légèrement anormale"),
    CRITIQUE("Critique", "Glycémie dangereuse - Action immédiate requise");

    private final String libelle;
    private final String description;

    NiveauAlerte(String libelle, String description) {
        this.libelle = libelle;
        this.description = description;
    }

    public String getLibelle() { return libelle; }
    public String getDescription() { return description; }
}