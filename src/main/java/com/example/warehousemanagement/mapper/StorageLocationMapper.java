package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.StorageLocationDTO;
import com.example.warehousemanagement.entity.StorageLocation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface StorageLocationMapper {

    @Mapping(target = "warehouseId", expression = "java(location.getWarehouse() != null ? location.getWarehouse().getId() : null)")
    @Mapping(target = "warehouseName", expression = "java(location.getWarehouse() != null ? location.getWarehouse().getName() : null)")
    StorageLocationDTO storageLocationToStorageLocationDTO(StorageLocation location);

    @Mapping(target = "warehouse", ignore = true)
    StorageLocation storageLocationDTOToStorageLocation(StorageLocationDTO dto);

}
