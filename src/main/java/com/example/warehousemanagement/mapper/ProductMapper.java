package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.ProductDTO;
import com.example.warehousemanagement.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(
            target = "categoryId",
            expression = "java(product.getCategory() != null ? product.getCategory().getId() : null)"
    )
    ProductDTO productToProductDTO(Product product);

    @Mapping(target = "category", ignore = true)
    Product productDTOToProduct(ProductDTO productDTO);
}
