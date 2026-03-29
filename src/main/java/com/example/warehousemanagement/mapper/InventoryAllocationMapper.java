package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.InventoryAllocationDTO;
import com.example.warehousemanagement.entity.InventoryAllocation;
import com.example.warehousemanagement.entity.StorageLocation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryAllocationMapper {

    @Mapping(target = "inventoryId", expression = "java(allocation.getInventory() != null ? allocation.getInventory().getId() : null)")
    @Mapping(target = "orderId", expression = "java(allocation.getOrder() != null ? allocation.getOrder().getId() : null)")
    @Mapping(target = "orderItemId", expression = "java(allocation.getOrderItem() != null ? allocation.getOrderItem().getId() : null)")
    @Mapping(target = "productId", expression = "java(productId(allocation))")
    @Mapping(target = "productSku", expression = "java(productSku(allocation))")
    @Mapping(target = "productName", expression = "java(productName(allocation))")
    @Mapping(target = "warehouseId", expression = "java(warehouseId(allocation))")
    @Mapping(target = "warehouseCode", expression = "java(warehouseCode(allocation))")
    @Mapping(target = "warehouseName", expression = "java(warehouseName(allocation))")
    @Mapping(target = "storageLocationId", expression = "java(storageLocationId(allocation))")
    @Mapping(target = "storageLocationLabel", expression = "java(storageLocationLabel(allocation))")
    InventoryAllocationDTO toDto(InventoryAllocation allocation);

    default Long productId(InventoryAllocation a) {
        if (a.getInventory() == null || a.getInventory().getProduct() == null) {
            return null;
        }
        return a.getInventory().getProduct().getId();
    }

    default String productSku(InventoryAllocation a) {
        if (a.getInventory() == null || a.getInventory().getProduct() == null) {
            return null;
        }
        return a.getInventory().getProduct().getSku();
    }

    default String productName(InventoryAllocation a) {
        if (a.getInventory() == null || a.getInventory().getProduct() == null) {
            return null;
        }
        return a.getInventory().getProduct().getName();
    }

    default Long warehouseId(InventoryAllocation a) {
        if (a.getInventory() == null || a.getInventory().getWarehouse() == null) {
            return null;
        }
        return a.getInventory().getWarehouse().getId();
    }

    default String warehouseCode(InventoryAllocation a) {
        if (a.getInventory() == null || a.getInventory().getWarehouse() == null) {
            return null;
        }
        return a.getInventory().getWarehouse().getWarehouseCode();
    }

    default String warehouseName(InventoryAllocation a) {
        if (a.getInventory() == null || a.getInventory().getWarehouse() == null) {
            return null;
        }
        return a.getInventory().getWarehouse().getName();
    }

    default Long storageLocationId(InventoryAllocation a) {
        if (a.getInventory() == null || a.getInventory().getStorageLocation() == null) {
            return null;
        }
        return a.getInventory().getStorageLocation().getId();
    }

    default String storageLocationLabel(InventoryAllocation a) {
        if (a.getInventory() == null) {
            return null;
        }
        StorageLocation sl = a.getInventory().getStorageLocation();
        if (sl == null) {
            return null;
        }
        if (sl.getLocationCode() != null && !sl.getLocationCode().isBlank()) {
            return sl.getLocationCode();
        }
        return sl.getName();
    }
}
