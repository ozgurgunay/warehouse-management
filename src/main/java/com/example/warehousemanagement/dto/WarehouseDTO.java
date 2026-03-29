package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.WarehouseStatus;
import lombok.Data;

@Data
public class WarehouseDTO {
    private Long id;
    /** Optional on create; server generates WH-xxxxx when blank. */
    private String warehouseCode;
    private String name;
    private String location;
    private String region;
    private WarehouseStatus status;
    private Long maxCapacityM2;
    private Long occupiedM2;
    private String contactNumber;
}
