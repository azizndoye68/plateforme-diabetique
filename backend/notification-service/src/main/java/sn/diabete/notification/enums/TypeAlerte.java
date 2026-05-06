package sn.diabete.notification.enums;

public enum TypeAlerte {
    HYPOGLYCEMIE_SEVERE("Hypoglycémie sévère"),
    HYPOGLYCEMIE("Hypoglycémie"),
    HYPERGLYCEMIE("Hyperglycémie"),
    HYPERGLYCEMIE_SEVERE("Hyperglycémie sévère"),
    INACTIVITE_PATIENT("Patient inactif"),
    RAPPEL_MESURE("Rappel de mesure"),

    // 🆕 Rendez-vous
    RENDEZ_VOUS_PLANIFIE("Rendez-vous planifié"),
    RENDEZ_VOUS_CONFIRME("Rendez-vous confirmé"),
    RENDEZ_VOUS_ANNULE("Rendez-vous annulé"),
    RENDEZ_VOUS_RAPPEL_J1("Rappel rendez-vous J-1"),
    RENDEZ_VOUS_RAPPEL_H2("Rappel rendez-vous H-2");

    private final String libelle;

    TypeAlerte(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() { return libelle; }
}