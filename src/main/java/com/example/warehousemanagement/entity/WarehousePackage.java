package com.example.warehousemanagement.entity;

import com.example.warehousemanagement.entity.enums.PackageType;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "warehousePackages")
@Data
public class WarehousePackage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    @OneToOne
    @JoinColumn(name = "barcode_id")
    private Barcode barcode;

    @OneToOne
    @JoinColumn(name = "qrcode_id")
    private QrCode qrCode;

    private Double weight;   // kg

    @Enumerated(EnumType.STRING)
    private PackageType packageType;

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackageItem> items;
}
