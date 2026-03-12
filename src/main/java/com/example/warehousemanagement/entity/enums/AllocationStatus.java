package com.example.warehousemanagement.entity.enums;

/**
 * Represents the lifecycle state of a stock allocation (reservation).
 */
public enum AllocationStatus {

    /**
     * Allocation is active and the reserved quantity is blocked for this order.
     */
    ACTIVE,

    /**
     * Allocation is released and the reserved quantity is returned back to available stock.
     */
    RELEASED,

    /**
     * Allocation is consumed by a shipment and the reserved quantity is deducted from physical stock.
     */
    USED,

    /**
     * Allocation is expired due to timeout (for example, unpaid or abandoned order).
     */
    EXPIRED
}

