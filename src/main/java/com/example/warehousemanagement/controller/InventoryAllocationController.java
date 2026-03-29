package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.InventoryAllocationDTO;
import com.example.warehousemanagement.dto.InventoryAllocationRequestDTO;
import com.example.warehousemanagement.entity.enums.AllocationStatus;
import com.example.warehousemanagement.service.InventoryAllocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

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
     * Paginated list with optional filters; newest first.
     */
    @GetMapping
    public ResponseEntity<Page<InventoryAllocationDTO>> getAllocations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) AllocationStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(
                inventoryAllocationService.getAllocations(
                        pageable, warehouseId, productId, orderId, status, dateFrom, dateTo));
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

