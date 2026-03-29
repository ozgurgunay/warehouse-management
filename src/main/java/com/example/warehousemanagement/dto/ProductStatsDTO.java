package com.example.warehousemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductStatsDTO {
    private long totalSku;
    private double averageUnitPrice;
    /** Sum of (unit price × available units) across all products. */
    private double totalInventoryValue;
    private long lowStockSkuCount;
    /** Products updated in the last 7 days. */
    private long recentlyUpdatedCount;
}
