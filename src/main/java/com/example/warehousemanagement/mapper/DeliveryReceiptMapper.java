package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.DeliveryReceiptDTO;
import com.example.warehousemanagement.entity.DeliveryReceipt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DeliveryReceiptMapper {

    @Mapping(source = "shipment.id", target = "shipmentId")
    DeliveryReceiptDTO deliveryReceiptToDeliveryReceiptDTO(DeliveryReceipt entity);

    @Mapping(source = "shipmentId", target = "shipment.id")
    DeliveryReceipt deliveryReceiptDTOToDeliveryReceipt(DeliveryReceiptDTO dto);

}
