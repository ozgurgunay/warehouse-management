package com.example.warehousemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfirmRegistrationRequest {

    @NotBlank(message = "Token is required")
    private String token;
}
