package com.example.warehousemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Full product detail for modal / detail page: master data + symbology + stock + history.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailDTO {
    private Long id;
    private String name;
    private String sku;
    private Double price;
    private String description;
    private Long categoryId;
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
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private Long barcodeId;
    private String barcodeCode;
    private Long qrCodeId;
    private String qrCodeValue;
    /** IN_STOCK | LOW_STOCK | OUT_OF_STOCK (from aggregated available units). */
    private String stockStatus;
    private int totalAvailableUnits;
    private List<ProductStockDistributionDTO> stockDistribution = new ArrayList<>();
    private List<ProductMovementHistoryDTO> movementHistory = new ArrayList<>();
}
