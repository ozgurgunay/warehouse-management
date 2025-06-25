package com.example.warehousemanagement.entity;


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

    @NotBlank(message = "Warehouse name cannot be empty.")
    private String name;

    @NotBlank(message = "Warehouse location cannot be empty.")
    private String location;

    // optional field or you can write moree moreee
    private Integer capacity;
    private String contactNumber;

    // There are multiple inventory records in a warehouse.
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Inventory> inventories = new ArrayList<>();

    // Optional: If you want to keep track of stock movements through the warehouse
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL)
    private List<StockMovement> stockMovements = new ArrayList<>();
}
