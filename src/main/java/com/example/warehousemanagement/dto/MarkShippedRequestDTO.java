package com.example.warehousemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MarkShippedRequestDTO {

    @NotBlank(message = "Carrier is required.")
    private String carrier;

    private String trackingNumber;

    @NotNull(message = "Shipped date/time is required.")
    private LocalDateTime shippedAt;
}
