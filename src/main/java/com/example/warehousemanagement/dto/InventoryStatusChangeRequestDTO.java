package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.InventoryStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class InventoryStatusChangeRequestDTO {
    @NotNull(message = "Inventory ID must not be null.")
    private Long inventoryId;

    @Positive(message = "Amount must be greater than 0.")
    private int amount;

    @NotNull(message = "Target status must not be null.")
    private InventoryStatus targetStatus;
}
