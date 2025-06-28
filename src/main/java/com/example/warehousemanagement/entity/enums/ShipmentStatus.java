package com.example.warehousemanagement.entity.enums;

public enum ShipmentStatus {
    PENDING,        // Label created, waiting to be sent
    IN_TRANSIT,     // On the way
    OUT_FOR_DELIVERY, // With courier, out for delivery
    DELIVERED,      // Delivered to recipient
    RETURNED,       // Returned to sender
    CANCELLED       // Shipment cancelled
}
