package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.CategoryStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    /** ACTIVE or ARCHIVED */
    private CategoryStatus status;
    /** Read-only: products linked to this category */
    private Long productCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
