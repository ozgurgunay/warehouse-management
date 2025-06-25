package com.example.warehousemanagement.entity;

import com.example.warehousemanagement.entity.enums.MovementType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;



@Data
@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Movement Type must be specified.")
    @Enumerated(EnumType.STRING)
    private MovementType movementType;

    private String reason;

    @NotNull(message = "Quantity change must be specified.")
    private int quantityChange;

    private LocalDateTime movementDate;

    // related product and warehouse
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    // Audit fields ex.
    @NotBlank(message = "Creator cannot be empty.")
    private String createdBy;
    @NotBlank(message = "Updated info cannot be empty.")
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        movementDate = LocalDateTime.now();
    }

}
