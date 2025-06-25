package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.StockMovementDTO;
import com.example.warehousemanagement.entity.StockMovement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StockMovementMapper {

    @Mapping(target = "productId", expression = "java(stockMovement.getProduct() != null ? stockMovement.getProduct().getId() : null)")
    @Mapping(target = "warehouseId", expression = "java(stockMovement.getWarehouse() != null ? stockMovement.getWarehouse().getId() : null)")
    StockMovementDTO stockMovementToStockMovementDTO(StockMovement stockMovement);

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    StockMovement stockMovementDTOToStockMovement(StockMovementDTO dto);

}
