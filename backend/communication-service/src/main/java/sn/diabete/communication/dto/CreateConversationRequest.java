package sn.diabete.communication.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConversationRequest {

    @NotNull(message = "L'ID du médecin cible est obligatoire")
    private Long targetMedecinId;

    @NotNull(message = "L'ID du médecin demandeur est obligatoire")
    private Long requestingMedecinId;
}