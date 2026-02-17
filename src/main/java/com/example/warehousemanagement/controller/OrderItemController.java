package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.OrderItemDTO;
import com.example.warehousemanagement.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;

    @Autowired
    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }


    // Add a new item to an order
    @PostMapping
    public ResponseEntity<OrderItemDTO> addOrderItem(@RequestBody OrderItemDTO dto) {
        OrderItemDTO created = orderItemService.addOrderItem(dto);
        return ResponseEntity.ok(created);
    }

    // Update an existing order item (e.g. quantity, price)
    @PutMapping("/{id}")
    public ResponseEntity<OrderItemDTO> updateOrderItem(@PathVariable Long id, @RequestBody OrderItemDTO dto) {
        OrderItemDTO updated = orderItemService.updateOrderItem(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    // Remove an item from an order
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderItem(@PathVariable Long id) {
        boolean deleted = orderItemService.deleteOrderItem(id);
        if (deleted) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    // Get all items for a given order
    @GetMapping("/by-order/{orderId}")
    public ResponseEntity<List<OrderItemDTO>> getItemsByOrder(@PathVariable Long orderId) {
        List<OrderItemDTO> items = orderItemService.getOrderItemsByOrder(orderId);
        return ResponseEntity.ok(items);
    }

    // Get a single order item by ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderItemDTO> getOrderItem(@PathVariable Long id) {
        OrderItemDTO dto = orderItemService.getOrderItem(id);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

}
