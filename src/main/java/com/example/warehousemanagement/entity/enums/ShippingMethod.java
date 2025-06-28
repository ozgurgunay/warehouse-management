package com.example.warehousemanagement.entity.enums;

public enum ShippingMethod {

    STANDARD_COURIER,    // Standard shipping via major courier companies (e.g., DHL, UPS, FedEx)
    EXPRESS_COURIER,     // Express/priority shipping (same-day or next-day delivery)
    CARGO_TRUCK,         // Bulk transportation using cargo trucks/logistics
    PICKUP_AT_STORE,     // Customer picks up the order at a physical store (click & collect)
    PICKUP_AT_WAREHOUSE, // Pickup directly from the warehouse
    IN_HOUSE_DELIVERY,   // Delivery by the company's own fleet/couriers
    LOCKER,              // Smart locker delivery (e.g., Amazon Locker)
    DRONE_DELIVERY,      // Drone delivery (for innovative/advanced logistics)
    BIKE_COURIER,        // Urban bike/motorcycle courier (for fast intra-city deliveries)
    INTERNATIONAL,       // International shipping/courier
    CUSTOM               // Other/custom delivery method (provide a description if needed)

}
