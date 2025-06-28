package com.example.warehousemanagement.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BarcodeDTO {

    private Long id;
    private String code;                // Barcode string
    private LocalDateTime createdAt;
    private String assignedToType;      // e.g. "PRODUCT", "PACKAGE"
    private Long assignedToId;
}
