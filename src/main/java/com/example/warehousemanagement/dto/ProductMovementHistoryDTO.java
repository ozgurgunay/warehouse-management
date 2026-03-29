package com.example.warehousemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductMovementHistoryDTO {
    private Long id;
    private String movementType;
    private String reason;
    private int quantityChange;
    private LocalDateTime movementDate;
    private String warehouseName;
    private String createdBy;
}
