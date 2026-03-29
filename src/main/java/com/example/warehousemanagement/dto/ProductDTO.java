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
    /** Populated on read responses. */
    private String categoryName;

    private String manufacturer;
    private String dimensionsText;
    private Double weightKg;
    private String material;
    private String operatingTempRange;
    private String ipRating;
    private String imageUrl;
    private Integer lowStockThreshold;

    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long barcodeId;     // Related barcode
    private Long qrCodeId;      // Related QR code
}
