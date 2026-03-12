package com.example.warehousemanagement.entity.enums;

public enum AdjustmentStatus {

    /**
     * Represents the workflow state of a stock adjustment request.
     */
    PENDING,   // Waiting for manager approval
    APPROVED,  // Manager approved, stock is updated
    REJECTED   // Manager rejected the count (usually requests a recount)


}
