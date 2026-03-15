package com.example.warehousemanagement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class InventoryAllocationRequestDTO {

    @NotNull(message = "Order ID must not be null.")
    private Long orderId;

    @NotNull(message = "Product ID must not be null.")
    private Long productId;

    @Positive(message = "Allocated quantity must be greater than 0.")
    private int quantity;
}