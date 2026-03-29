package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.ToString;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    /** Optional manufacturer / brand (catalog & detail UI). */
    @Column(length = 255)
    private String manufacturer;

    /** Human-readable dimensions, e.g. "120 x 85 x 85 mm". */
    @Column(name = "dimensions_text", length = 128)
    private String dimensionsText;

    /** Weight in kilograms. */
    private Double weightKg;

    @Column(length = 128)
    private String material;

    /** Operating temperature range label, e.g. "-20°C to +85°C". */
    @Column(name = "operating_temp_range", length = 64)
    private String operatingTempRange;

    @Column(name = "ip_rating", length = 32)
    private String ipRating;

    /** Public URL for product image (optional). */
    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    /**
     * When total available stock is &lt;= this value (and &gt; 0), UI shows "low stock".
     * If null, a default threshold is applied in the API layer.
     */
    private Integer lowStockThreshold;

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

    @OneToOne
    @JoinColumn(name = "barcode_id")
    private Barcode barcode;

    @OneToOne
    @JoinColumn(name = "qrcode_id")
    private QrCode qrCode;

    @ToString.Exclude
    @OneToMany(mappedBy = "product")
    private List<Inventory> inventories = new ArrayList<>();

}

