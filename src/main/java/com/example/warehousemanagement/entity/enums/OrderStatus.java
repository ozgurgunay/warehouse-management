package com.example.warehousemanagement.entity.enums;

public enum OrderStatus {
    PENDING,    //Awaiting approval or payment
    APPROVED,   //Approved for processing
    PACKING,    //Being prepared/packed
    SHIPPED,    //Handed over to carrier
    DELIVERED,  //Delivered to customer
    CANCELLED,  //Cancelled by customer/operator
    RETURNED    //Returned by customer
}
