package com.example.warehousemanagement.dto;

import lombok.Data;

@Data
public class StorageLocationDTO {
    private Long id;
    /** Required on create; immutable after create (location does not move between warehouses). */
    private Long warehouseId;
    /** Denormalized for list/detail UI. */
    private String warehouseName;
    /** Optional on create; server generates L-xxxxx when blank. Unique per warehouse. */
    private String locationCode;
    private String name;
    private String building;
    private String floor;
    private String section;
    private String zoneLabel;
}
