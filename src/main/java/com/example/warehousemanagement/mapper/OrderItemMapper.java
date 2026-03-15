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

    @Mapping(target = "order", ignore = true)
    @Mapping(target = "product", ignore = true)
    OrderItem orderItemDTOToOrderItem(OrderItemDTO dto);

}
