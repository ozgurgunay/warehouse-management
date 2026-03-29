package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.ConsentType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ConsentAcceptanceDTO {

    @NotNull
    private ConsentType consentType;

    @NotBlank
    @Size(max = 64)
    private String documentVersion;

    @NotNull
    @AssertTrue(message = "Consent must be explicitly accepted")
    private Boolean accepted;
}
