package com.example.warehousemanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QrCodeDTO {

    private Long id;
    private String code;             // QR code string
    private LocalDateTime createdAt;
    private String assignedToType;   // "PRODUCT", "PACKAGE", etc.
    private Long productId;          // If assigned, product's id
    private Long packageId;          // If assigned, package's id

}
