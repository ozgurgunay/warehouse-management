package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.OrderItemDTO;
import com.example.warehousemanagement.entity.OrderItem;
import com.example.warehousemanagement.mapper.OrderItemMapper;
import com.example.warehousemanagement.repository.OrderItemRepository;
import com.example.warehousemanagement.repository.OrderRepository;
import com.example.warehousemanagement.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderItemMapper orderItemMapper;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Autowired
    public OrderItemService(OrderItemRepository orderItemRepository, OrderItemMapper orderItemMapper,
                            OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderItemRepository = orderItemRepository;
        this.orderItemMapper = orderItemMapper;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    /* adds a product as an item to a specific order  */
    public OrderItemDTO addOrderItem(OrderItemDTO dto) {
        OrderItem item = orderItemMapper.orderItemDTOToOrderItem(dto);
        item.setOrder(orderRepository.findById(dto.getOrderId()).orElse(null));
        item.setProduct(productRepository.findById(dto.getProductId()).orElse(null));
        // calculate total price
        item.setTotalPrice(item.getUnitPrice() * item.getQuantity());
        return orderItemMapper.orderItemToOrderItemDTO(orderItemRepository.save(item));
    }


    /**
     * updates quantity, unit price, batch/lot number, barcode/qr for an item.
     */
    public OrderItemDTO updateOrderItem(Long id, OrderItemDTO dto) {
        return orderItemRepository.findById(id).map(existing -> {
            existing.setQuantity(dto.getQuantity());
            existing.setUnitPrice(dto.getUnitPrice());
            existing.setTotalPrice(dto.getUnitPrice() * dto.getQuantity());
            existing.setBatchNo(dto.getBatchNo());
            existing.setBarcode(dto.getBarcode());
            existing.setQrCode(dto.getQrCode());
            // If product/order can change, add update logic here
            return orderItemMapper.orderItemToOrderItemDTO(orderItemRepository.save(existing));
        }).orElse(null);
    }

    /*  removes an order item by its ID */
    public boolean deleteOrderItem(Long id) {
        if(orderItemRepository.existsById(id)) {
            orderItemRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /* gets all items for a specific order */
    public List<OrderItemDTO> getOrderItemsByOrder(Long orderId) {
        return orderItemRepository.findByOrderId(orderId)
                .stream()
                .map(orderItemMapper::orderItemToOrderItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * gets a single order item by its ID
     */
    public OrderItemDTO getOrderItem(Long id) {
        return orderItemRepository.findById(id)
                .map(orderItemMapper::orderItemToOrderItemDTO)
                .orElse(null);
    }

    /**
     * returns all items in the system (admin/reporting purposes)
     */
    public List<OrderItemDTO> getAllOrderItems() {
        return orderItemRepository.findAll()
                .stream()
                .map(orderItemMapper::orderItemToOrderItemDTO)
                .collect(Collectors.toList());
    }

    // Additional methods could be:
    // - Get items by barcode/qrCode
    // - Update stock when an order item is created (inventory integration)
    // - Return item for refunds, etc.
}
