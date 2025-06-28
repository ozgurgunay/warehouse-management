package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "barcodes")
@Data
public class Barcode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // Barcode string

    private LocalDateTime createdAt;

    // type (e.g., "PRODUCT", "PACKAGE")
    private String assignedToType;

    // if you want direct mapping
    @OneToOne(mappedBy = "barcode")
    private Product product;

    @OneToOne(mappedBy = "barcode")
    private WarehousePackage pkg;

}
