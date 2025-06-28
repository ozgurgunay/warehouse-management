package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "package_items")
@Data
public class PackageItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private WarehousePackage pkg;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;
}
