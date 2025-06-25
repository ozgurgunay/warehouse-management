package com.example.warehousemanagement.dto;

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
    private String batchNumber;
    private LocalDate expiryDate;
    // Relation: StorageLocation (optional)
    private Long storageLocationId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
