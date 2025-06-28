package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.ShipmentDTO;
import com.example.warehousemanagement.entity.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WarehousePackageMapper.class, DeliveryReceiptMapper.class})
public interface ShipmentMapper {
    @Mapping(source = "order.id", target = "orderId")
    ShipmentDTO shipmentToShipmentDTO(Shipment entity);

    @Mapping(source = "orderId", target = "order.id")
    Shipment shipmentToShipmentEntity(ShipmentDTO dto);
}
