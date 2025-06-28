package com.example.warehousemanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DeliveryReceiptDTO {

    private Long id;
    private Long shipmentId;        // Reference to Shipment entity
    private String receiverName;
    private String receiverPhone;
    private String deliveryNote;
    private LocalDateTime deliveredAt;


}
