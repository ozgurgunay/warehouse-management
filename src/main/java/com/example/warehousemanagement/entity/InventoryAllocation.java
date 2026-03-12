package com.example.warehousemanagement.entity;

import com.example.warehousemanagement.entity.enums.AllocationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Represents a reservation of stock for a specific order.
 * Links the WMS inventory directly to the Order management system.
 */
@Data
@Entity
@Table(name = "inventory_allocations")
public class InventoryAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The specific inventory record from which the stock is reserved.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    /**
     * The exact Order that requested this reservation.
     * (Linked directly to your existing Order entity)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * Optional: If you want to link it to a specific OrderItem.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    /**
     * The amount of stock reserved.
     */
    @Positive(message = "Allocated quantity must be positive.")
    private int allocatedQuantity;

    /**
     * Time when this allocation will automatically expire if not used.
     */
    private LocalDateTime expirationTime;

    /**
     * Current lifecycle status of this allocation (active, released, used, expired).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AllocationStatus status = AllocationStatus.ACTIVE;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        if (this.status == null) {
            this.status = AllocationStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
