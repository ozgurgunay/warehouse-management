package com.example.warehousemanagement.entity;

import com.example.warehousemanagement.entity.enums.AdjustmentStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Represents a physical count difference that needs managerial approval.
 */
@Data
@Entity
@Table(name = "stock_adjustments")
public class StockAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    /**
     * Expected quantity according to the system.
     */
    @Column(nullable = false)
    private int systemQuantity;

    /**
     * Actual quantity counted by the warehouse worker.
     */
    @Column(nullable = false)
    private int countedQuantity;

    /**
     * The difference (Counted - System).
     */
    @Column(nullable = false)
    private int variance;

    @Column(length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdjustmentStatus status = AdjustmentStatus.PENDING;

    private String requestedBy;
    private String approvedBy;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.variance = this.countedQuantity - this.systemQuantity;
    }

    @PreUpdate
    protected void onUpdate() {
        this.variance = this.countedQuantity - this.systemQuantity;
    }
}
