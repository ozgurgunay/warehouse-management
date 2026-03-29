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
    @Mapping(
            target = "categoryName",
            expression = "java(product.getCategory() != null ? product.getCategory().getName() : null)"
    )
    @Mapping(
            target = "barcodeId",
            expression = "java(product.getBarcode() != null ? product.getBarcode().getId() : null)"
    )
    @Mapping(
            target = "qrCodeId",
            expression = "java(product.getQrCode() != null ? product.getQrCode().getId() : null)"
    )
    ProductDTO productToProductDTO(Product product);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "barcode", ignore = true)
    @Mapping(target = "qrCode", ignore = true)
    @Mapping(target = "inventories", ignore = true)
    Product productDTOToProduct(ProductDTO productDTO);
}
