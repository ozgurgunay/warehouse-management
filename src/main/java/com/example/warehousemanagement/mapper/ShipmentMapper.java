package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.ShipmentDTO;
import com.example.warehousemanagement.entity.Shipment;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring", uses = {WarehousePackageMapper.class, DeliveryReceiptMapper.class})
public interface ShipmentMapper {

    @Mapping(source = "order.id", target = "orderId")
    @Mapping(target = "orderDate", expression = "java(orderDate(entity))")
    @Mapping(target = "customerName", expression = "java(customerName(entity))")
    ShipmentDTO shipmentToShipmentDTO(Shipment entity);

    @BeanMapping(ignoreUnmappedSourceProperties = {"orderDate", "customerName"})
    @Mapping(source = "orderId", target = "order.id")
    Shipment shipmentDTOToShipment(ShipmentDTO dto);

    default LocalDateTime orderDate(Shipment s) {
        return s.getOrder() != null ? s.getOrder().getOrderDate() : null;
    }

    default String customerName(Shipment s) {
        if (s.getOrder() == null || s.getOrder().getCustomer() == null) {
            return null;
        }
        return s.getOrder().getCustomer().getFullName();
    }
}
