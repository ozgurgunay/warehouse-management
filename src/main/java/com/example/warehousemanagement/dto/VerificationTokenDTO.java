package com.example.warehousemanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VerificationTokenDTO {

    private Long id;
    private String token;
    private Long userId;
    private LocalDateTime expiryDate;

}
