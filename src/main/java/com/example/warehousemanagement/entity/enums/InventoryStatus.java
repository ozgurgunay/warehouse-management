package com.example.warehousemanagement.entity.enums;

public enum InventoryStatus {
    AVAILABLE,      // Sellable, healthy stock
    RESERVED,       // Reserved for an order but not yet shipped
    QUARANTINE,     // Newly received or returned, under inspection (not sellable)
    DAMAGED,        // Damaged stock (not sellable)
    MISSING,        // Missing during physical count (not sellable)
    EXPIRED         // Expiration date passed (not sellable)
}

