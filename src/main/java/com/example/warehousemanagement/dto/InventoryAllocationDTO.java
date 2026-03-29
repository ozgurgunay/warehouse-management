package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.AllocationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InventoryAllocationDTO {

    private Long id;
    private Long inventoryId;
    private Long orderId;
    private Long orderItemId;

    private Long productId;
    private String productSku;
    private String productName;

    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;

    private Long storageLocationId;
    private String storageLocationLabel;

    private int allocatedQuantity;
    private LocalDateTime expirationTime;
    private AllocationStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
