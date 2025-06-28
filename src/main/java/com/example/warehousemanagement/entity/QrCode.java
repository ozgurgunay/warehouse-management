package com.example.warehousemanagement.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_codes")
@Data
public class QrCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // QR code string

    private LocalDateTime createdAt;

    //type (e.g., "PRODUCT", "PACKAGE")
    private String assignedToType;

    // if you want direct mapping (example for Product)
    @OneToOne(mappedBy = "qrCode")
    private Product product;

    @OneToOne(mappedBy = "qrCode")
    private WarehousePackage pkg;
}
