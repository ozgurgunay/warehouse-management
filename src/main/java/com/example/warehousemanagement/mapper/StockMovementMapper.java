package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.StockMovementDTO;
import com.example.warehousemanagement.entity.StockMovement;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StockMovementMapper {

    @Mapping(target = "productId", expression = "java(stockMovement.getProduct() != null ? stockMovement.getProduct().getId() : null)")
    @Mapping(target = "warehouseId", expression = "java(stockMovement.getWarehouse() != null ? stockMovement.getWarehouse().getId() : null)")
    @Mapping(target = "productSku", expression = "java(stockMovement.getProduct() != null ? stockMovement.getProduct().getSku() : null)")
    @Mapping(target = "productName", expression = "java(stockMovement.getProduct() != null ? stockMovement.getProduct().getName() : null)")
    @Mapping(target = "warehouseCode", expression = "java(stockMovement.getWarehouse() != null ? stockMovement.getWarehouse().getWarehouseCode() : null)")
    @Mapping(target = "warehouseName", expression = "java(stockMovement.getWarehouse() != null ? stockMovement.getWarehouse().getName() : null)")
    StockMovementDTO stockMovementToStockMovementDTO(StockMovement stockMovement);

    @BeanMapping(
            ignoreUnmappedSourceProperties = {
                    "productSku",
                    "productName",
                    "warehouseCode",
                    "warehouseName"
            }
    )
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    StockMovement stockMovementDTOToStockMovement(StockMovementDTO dto);

}
