package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;

    private Double unitPrice;   // Price at order time (could be discounted)
    private Double totalPrice;  // quantity * unitPrice

    private String batchNo; // Optional: Batch/Lot number of the item

    @Column(unique = true)
    private String barcode;   // Classic barcode string
    @Column(unique = true)
    private String qrCode;    // QR code data string (may match barcode or be separate)


}
