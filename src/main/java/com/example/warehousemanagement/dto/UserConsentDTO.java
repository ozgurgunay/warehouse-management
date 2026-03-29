package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.ConsentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserConsentDTO {

    private Long id;
    private ConsentType consentType;
    private String documentVersion;
    private LocalDateTime consentedAt;
    private LocalDateTime withdrawnAt;
}
