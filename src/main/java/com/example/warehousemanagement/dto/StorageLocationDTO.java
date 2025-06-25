package com.example.warehousemanagement.dto;

import lombok.Data;

@Data
public class StorageLocationDTO {
    private Long id;
    private String name;
    private String building;
    private String floor;
    private String section;

}
