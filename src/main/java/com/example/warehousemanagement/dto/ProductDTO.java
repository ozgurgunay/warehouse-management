package com.example.warehousemanagement.dto;

import lombok.Data;


import java.time.LocalDateTime;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String sku;
    private Double price;
    private String description;
    // Relation: Category
    private Long categoryId;

    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
