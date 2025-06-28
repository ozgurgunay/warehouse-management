package com.example.warehousemanagement.dto;

import lombok.Data;

@Data
public class PackageItemDTO {

    private Long id;
    private Long packageId;    // Reference to Package
    private Long productId;    // Reference to Product
    private Integer quantity;

}
