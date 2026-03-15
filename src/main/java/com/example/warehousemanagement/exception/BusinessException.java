package com.example.warehousemanagement.exception;

/**
 * Base type for business rule violations in the warehouse domain.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}

