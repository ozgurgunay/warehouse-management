package com.example.warehousemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * One row for the products catalog table (aggregated stock + UI labels).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCatalogRowDTO {
    private Long id;
    private String name;
    private String sku;
    private Double price;
    private String description;
    private Long categoryId;
    private String categoryName;
    /** Sum of available units (quantity - allocated) across AVAILABLE inventory rows. */
    private int totalAvailableUnits;
    /** IN_STOCK | LOW_STOCK | OUT_OF_STOCK */
    private String stockStatus;
    private Integer lowStockThreshold;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long barcodeId;
    private Long qrCodeId;
    /** Short label for primary storage (first location with stock), optional. */
    private String primaryLocationLabel;
}
