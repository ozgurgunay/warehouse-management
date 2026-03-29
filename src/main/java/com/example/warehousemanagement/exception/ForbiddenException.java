package com.example.warehousemanagement.exception;

/**
 * Used when an authenticated user attempts an action they are not allowed to perform (HTTP 403).
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
