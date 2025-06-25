package com.example.warehousemanagement.dto;

import lombok.Data;

@Data
public class WarehouseDTO {
    private Long id;
    private String name;
    private String location;
    private Integer capacity;
    private String contactNumber;
}
