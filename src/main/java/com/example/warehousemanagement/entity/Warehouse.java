package com.example.warehousemanagement.entity;


import com.example.warehousemanagement.entity.enums.WarehouseStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "warehouses")
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable code for UI (e.g. WH-TX-001). Generated on create if omitted. */
    @Column(unique = true, length = 48)
    private String warehouseCode;

    @NotBlank(message = "Warehouse name cannot be empty.")
    private String name;

    @NotBlank(message = "Warehouse location cannot be empty.")
    private String location;

    /** Region label for filtering (e.g. US-South, APAC). */
    @Column(length = 64)
    private String region;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(32) default 'ACTIVE'")
    private WarehouseStatus status = WarehouseStatus.ACTIVE;

    /** Maximum storage capacity in square meters (m²). */
    private Long maxCapacityM2;

    /** Currently occupied area in m² (must not exceed maxCapacityM2 when both set). */
    private Long occupiedM2;

    private String contactNumber;

    // There are multiple inventory records in a warehouse.
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Inventory> inventories = new ArrayList<>();

    @OneToMany(mappedBy = "warehouse")
    private List<StorageLocation> storageLocations = new ArrayList<>();

    // Optional: If you want to keep track of stock movements through the warehouse
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL)
    private List<StockMovement> stockMovements = new ArrayList<>();
}
