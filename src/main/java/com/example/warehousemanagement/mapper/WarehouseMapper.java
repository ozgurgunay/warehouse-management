package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.WarehouseDTO;
import com.example.warehousemanagement.entity.Warehouse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {

    WarehouseDTO warehouseToWarehouseDTO(Warehouse warehouse);

    Warehouse warehouseDTOToWarehouse(WarehouseDTO warehouseDTO);
}
