package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.OrderDTO;
import com.example.warehousemanagement.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderMapper {

    @Mapping(source = "customer.id", target = "customerId")
    OrderDTO orderToOrderDTO(Order entity);

    @Mapping(source = "customerId", target = "customer.id")
    Order orderDTOToOrder(OrderDTO dto);
}
