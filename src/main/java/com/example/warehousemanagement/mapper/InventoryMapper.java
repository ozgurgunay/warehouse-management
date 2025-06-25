package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.InventoryDTO;
import com.example.warehousemanagement.entity.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

//    Mapping from Inventory entity to InventoryDTO
    @Mapping(target = "productId", expression = "java(inventory.getProduct() != null ? inventory.getProduct().getId() : null)")
    @Mapping(target = "warehouseId", expression = "java(inventory.getWarehouse() != null ? inventory.getWarehouse().getId() : null)")
    @Mapping(target = "storageLocationId", expression = "java(inventory.getStorageLocation() != null ? inventory.getStorageLocation().getId() : null)")
    InventoryDTO inventoryToInventoryDTO(Inventory inventory);

//    Mapping from InventoryDTO to Inventory entity
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "storageLocation", ignore = true)
    Inventory inventoryDTOToInventory(InventoryDTO dto);

}
