package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.InventoryStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class InventoryDTO {
    private Long id;
    // Relation: Product
    private Long productId;
    // Relation: Warehouse
    private Long warehouseId;
    private int quantity;
    /** Reserved quantity (read-only in list responses). */
    private Integer quantityAllocated;
    /** Physical minus allocated (read-only). */
    private Integer availableQuantity;
    private String batchNumber;
    private LocalDate expiryDate;
    // Relation: StorageLocation (optional)
    private Long storageLocationId;

    /** Read-only: populated on GET list/detail for UI. */
    private String productSku;
    private String productName;
    private String warehouseCode;
    private String warehouseName;
    /** Storage location code or name; null if not bin-level. */
    private String storageLocationLabel;

    private InventoryStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
