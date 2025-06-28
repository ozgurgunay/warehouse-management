package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.OrderItemDTO;
import com.example.warehousemanagement.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "product.id", target = "productId")
    OrderItemDTO orderItemToOrderItemDTO(OrderItem entity);

    @Mapping(source = "orderId", target = "order.id")
    @Mapping(source = "productId", target = "product.id")
    OrderItem orderItemDTOToOrderItem(OrderItemDTO dto);

}
