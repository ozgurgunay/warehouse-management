package com.example.warehousemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseStatsDTO {
    private long totalWarehouses;
    /** Weighted average occupancy: sum(occupiedM2) / sum(maxCapacityM2) * 100, or 0 if no capacity data. */
    private double averageOccupancyPercent;
    /** Sum of maxCapacityM2 across warehouses (nulls treated as 0). */
    private long totalCapacityM2Sum;
}
