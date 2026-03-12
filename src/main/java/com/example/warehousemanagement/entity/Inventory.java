package com.example.warehousemanagement.entity;

import com.example.warehousemanagement.entity.enums.InventoryStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
@Entity
@Table(name = "inventories")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relation with Product table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // relation with Warehouse table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @PositiveOrZero(message = "Allocated quantity cannot be negative.")
    @Column(columnDefinition = "integer default 0")
    private Integer quantityAllocated = 0;

    /**
     * nnote
     * This 'quantity' field represents the PHYSICAL items currently sitting on the warehouse shelf.
     * Decrease it ONLY when the order is physically shipped (Package/Shipment phase).
     * To find "Available Stock for Sale", subtract the total allocated quantity (from InventoryAllocation) from this field.
     */
    @PositiveOrZero(message = "Stock quantity cannot be negative.")
    private int quantity;

    private String batchNumber;
    private LocalDate expiryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private StorageLocation storageLocation;

    // Version field: For Optimistic Locking
    @Version
    private Integer version;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'AVAILABLE'")
    private InventoryStatus status = InventoryStatus.AVAILABLE; // Default value

    /**
     * Calculates the dynamically available quantity without persisting it to the database.
     */
    @Transient
    public int getAvailableQuantity() {
        int allocated = (this.quantityAllocated != null) ? this.quantityAllocated : 0;
        return this.quantity - allocated;
    }

}