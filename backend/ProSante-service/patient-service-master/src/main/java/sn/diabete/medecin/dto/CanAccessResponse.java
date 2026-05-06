package sn.diabete.medecin.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CanAccessResponse {
    private boolean canAccess;
}