package com.example.warehousemanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {

    private Long id;
    private Long customerId;                       // Reference to Customer entity (only ID for DTO)
    private LocalDateTime orderDate;
    private String status;                         // OrderStatus as String (enum values as String)
    private String paymentStatus;                  // PaymentStatus as String
    private Double totalAmount;
    private String shippingAddress;
    private String billingAddress;                 // Optional
    private List<OrderItemDTO> items;              // List of order items (DTO)
    private String shipmentStatus;                 // ShipmentStatus as String
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;

}
