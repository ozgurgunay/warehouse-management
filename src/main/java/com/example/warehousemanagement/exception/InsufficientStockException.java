package com.example.warehousemanagement.exception;

/**
 * Indicates that the requested stock operation cannot be completed
 * because there is not enough available quantity.
 */
public class InsufficientStockException extends BusinessException {

    public InsufficientStockException(String message) {
        super(message);
    }
}

