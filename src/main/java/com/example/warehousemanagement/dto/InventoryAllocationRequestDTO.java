package com.example.warehousemanagement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AllocationRequestDTO {

    @NotNull(message = "Sipariş ID boş olamaz.")
    private Long orderId;

    @NotNull(message = "Ürün ID boş olamaz.")
    private Long productId;

    @Positive(message = "Rezerve edilecek miktar 0'dan büyük olmalıdır.")
    private int quantity;
}