package com.example.warehousemanagement.dto;

import lombok.Data;

@Data
public class OrderItemDTO {

    private Long id;
    private Long orderId;        // Reference to Order
    private Long productId;      // Reference to Product
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private String batchNo;      // Optional: batch/lot number
    private String barcode;      // Barcode string
    private String qrCode;       // QR code string

}
