package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.InventoryAllocationRequestDTO;
import com.example.warehousemanagement.service.InventoryAllocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoints for managing stock allocations (reservations) for orders.
 */
@RestController
@RequestMapping("/inventory-allocations")
public class InventoryAllocationController {

    private final InventoryAllocationService inventoryAllocationService;

    @Autowired
    public InventoryAllocationController(InventoryAllocationService inventoryAllocationService) {
        this.inventoryAllocationService = inventoryAllocationService;
    }

    /**
     * Creates stock allocations for a given order using FEFO strategy.
     */
    @PostMapping
    public ResponseEntity<Void> allocateStock(@Valid @RequestBody InventoryAllocationRequestDTO request) {
        inventoryAllocationService.allocateStockForOrder(
                request.getOrderId(),
                request.getProductId(),
                request.getQuantity()
        );
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}

