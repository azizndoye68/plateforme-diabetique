package sn.diabete.auth.entity;

public enum StatutCompte {
    PENDING,   // En attente de validation par un administrateur
    APPROVED,  // Compte validé et actif
    REJECTED,   // Refusé par l’administrateur
}
