package com.example.warehousemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StorageLocationStatsDTO {
    private long totalLocations;
    /** Locations that hold at least one inventory line with positive quantity. */
    private long occupiedBins;
    /** Storage locations with no positive stock (no row or all qty 0). */
    private long emptyBins;
    /** occupiedBins / totalLocations * 100, or 0 if total is 0. */
    private double occupancyPercent;
    /** Zone label with the most locations (optional UI highlight). */
    private String hotZoneLabel;
}
