package sn.diabete.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordUpdateRequest {
    @NotBlank(message = "L'ancien mot de passe est obligatoire")
    private String oldPassword;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @Size(min = 12, max = 72, message = "Le mot de passe doit contenir entre 12 et 72 caractères")
    private String newPassword;
}
