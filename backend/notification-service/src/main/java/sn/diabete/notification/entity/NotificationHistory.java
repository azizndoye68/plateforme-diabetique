package sn.diabete.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.diabete.notification.enums.CanalNotification;
import sn.diabete.notification.enums.StatutNotification;
import sn.diabete.notification.enums.TypeAlerte;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_history")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;

    private Long medecinId;

    @Enumerated(EnumType.STRING)
    private TypeAlerte typeAlerte;

    @Enumerated(EnumType.STRING)
    private CanalNotification canal;

    @Enumerated(EnumType.STRING)
    private StatutNotification statut;

    @Column(length = 2000)
    private String message;

    private String destinataire; // email ou numéro de téléphone

    private LocalDateTime dateEnvoi;

    private LocalDateTime dateLecture;

    private Long glycemieId; // Référence à la mesure concernée

    @PrePersist
    protected void onCreate() {
        this.dateEnvoi = LocalDateTime.now();
    }
}