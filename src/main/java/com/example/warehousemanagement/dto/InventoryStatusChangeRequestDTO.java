package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.InventoryStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class InventoryStatusChangeRequestDTO {
    @NotNull(message = "Inventory ID boş olamaz.")
    private Long inventoryId;

    @Positive(message = "Miktar 0'dan büyük olmalı.")
    private int amount;

    @NotNull(message = "Hedef statü seçilmelidir.")
    private InventoryStatus targetStatus;
}
