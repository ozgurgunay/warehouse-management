package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.StorageLocationDTO;
import com.example.warehousemanagement.entity.StorageLocation;
import org.mapstruct.Mapper;



@Mapper(componentModel = "spring")
public interface StorageLocationMapper {


    StorageLocationDTO storageLocationToStorageLocationDTO(StorageLocation location);

    StorageLocation storageLocationDTOToStorageLocation(StorageLocationDTO dto);

}
