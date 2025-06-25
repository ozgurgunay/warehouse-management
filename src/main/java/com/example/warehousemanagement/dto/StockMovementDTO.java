package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.MovementType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StockMovementDTO {
    private Long id;
    private MovementType movementType; // Enum: INBOUND, OUTBOUND, TRANSFER
    private String reason;
    private int quantityChange;
    private LocalDateTime movementDate;
    // Relations
    private Long productId;
    private Long warehouseId;

    private String createdBy;
    private String updatedBy;
}
