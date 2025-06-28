package com.example.warehousemanagement.entity;

import com.example.warehousemanagement.entity.enums.OrderStatus;
import com.example.warehousemanagement.entity.enums.PaymentStatus;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer; // Customer (user) who placed the order

    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private Double totalAmount;

    private String shippingAddress;

    private String billingAddress; // Optional, if needed

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipment_status")
    private ShipmentStatus shipmentStatus;

    private LocalDateTime expectedDeliveryDate; // Date promised to the customer

    private LocalDateTime actualDeliveryDate;   // Actual delivery date (set when shipment is delivered)

}
