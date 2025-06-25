package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;


import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name cannot be empty.")
    private String name;

    @NotBlank(message = "SKU(stock keeping unit) cannot be empty.")
    @Column(unique = true)
    private String sku;

    @Positive(message = "Price should be positive.")
    private Double price;

    @Column(length = 1000)
    private String description;

    // Audit field mandatory
    @NotBlank(message = "Creator information cannot be empty.")
    @Column(name = "createdBy")
    private String createdBy;

    @NotBlank(message = "Updated info cannot be empty.")
    @Column(name = "updatedBy")
    private String updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Category relationship: Each product belongs to a category.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}

