package com.example.warehousemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCatalogPageDTO {
    private List<ProductCatalogRowDTO> content = new ArrayList<>();
    private long totalElements;
    private int totalPages;
    private int number;
    private int size;
}
