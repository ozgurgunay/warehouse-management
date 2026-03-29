package com.example.warehousemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductStockDistributionDTO {
    private Long warehouseId;
    /** Display name for the facility (warehouse name). */
    private String facilityName;
    /** Building / floor / section from storage location when present. */
    private String locationBfs;
    private int availableUnits;
    /** ACTIVE | LOW_STOCK | OUT_OF_STOCK */
    private String rowStatus;
}
