package com.example.warehousemanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard error response body for REST API errors.
 */
@Data
@Builder
public class ApiError {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    /**
     * Optional map of validation errors where the key is the field name
     * and the value is the related validation message.
     */
    private Map<String, String> validationErrors;
}

