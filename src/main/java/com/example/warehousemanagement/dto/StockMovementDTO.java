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

    /** Read-only: populated on GET for list/detail UI. */
    private String productSku;
    private String productName;
    private String warehouseCode;
    private String warehouseName;

    private String createdBy;
    private String updatedBy;
}
