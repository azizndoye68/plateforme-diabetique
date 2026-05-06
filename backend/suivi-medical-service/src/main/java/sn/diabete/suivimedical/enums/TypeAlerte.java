package sn.diabete.suivimedical.enums;

public enum TypeAlerte {
    HYPOGLYCEMIE_SEVERE("Hypoglycémie sévère"),
    HYPOGLYCEMIE("Hypoglycémie"),
    HYPERGLYCEMIE("Hyperglycémie"),
    HYPERGLYCEMIE_SEVERE("Hyperglycémie sévère");

    private final String libelle;

    TypeAlerte(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() { return libelle; }
}