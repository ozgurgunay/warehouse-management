package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.InventoryDTO;
import com.example.warehousemanagement.entity.Inventory;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "productId", expression = "java(inventory.getProduct() != null ? inventory.getProduct().getId() : null)")
    @Mapping(target = "warehouseId", expression = "java(inventory.getWarehouse() != null ? inventory.getWarehouse().getId() : null)")
    @Mapping(target = "storageLocationId", expression = "java(inventory.getStorageLocation() != null ? inventory.getStorageLocation().getId() : null)")
    @Mapping(target = "productSku", expression = "java(inventory.getProduct() != null ? inventory.getProduct().getSku() : null)")
    @Mapping(target = "productName", expression = "java(inventory.getProduct() != null ? inventory.getProduct().getName() : null)")
    @Mapping(target = "warehouseCode", expression = "java(inventory.getWarehouse() != null ? inventory.getWarehouse().getWarehouseCode() : null)")
    @Mapping(target = "warehouseName", expression = "java(inventory.getWarehouse() != null ? inventory.getWarehouse().getName() : null)")
    @Mapping(target = "storageLocationLabel", expression = "java(storageLocationLabel(inventory))")
    @Mapping(target = "quantityAllocated", source = "quantityAllocated")
    @Mapping(target = "availableQuantity", expression = "java(inventory.getAvailableQuantity())")
    InventoryDTO inventoryToInventoryDTO(Inventory inventory);

    @BeanMapping(
            ignoreUnmappedSourceProperties = {
                    "productSku",
                    "productName",
                    "warehouseCode",
                    "warehouseName",
                    "storageLocationLabel",
                    "availableQuantity",
                    "status"
            }
    )
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "storageLocation", ignore = true)
    Inventory inventoryDTOToInventory(InventoryDTO dto);

    default String storageLocationLabel(Inventory inventory) {
        if (inventory.getStorageLocation() == null) {
            return null;
        }
        var sl = inventory.getStorageLocation();
        if (sl.getLocationCode() != null && !sl.getLocationCode().isBlank()) {
            return sl.getLocationCode();
        }
        return sl.getName();
    }
}
