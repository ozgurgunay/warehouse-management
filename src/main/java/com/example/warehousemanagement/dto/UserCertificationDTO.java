package com.example.warehousemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserCertificationDTO {

    private Long id;

    @NotBlank
    @Size(max = 120)
    private String certificationType;

    @Size(max = 120)
    private String certificateNumber;

    private LocalDate issuedAt;

    private LocalDate expiresAt;

    @Size(max = 200)
    private String issuerName;
}
