package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.StockMovementDTO;
import com.example.warehousemanagement.entity.enums.MovementType;
import com.example.warehousemanagement.service.StockMovementService;
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

@RestController
@RequestMapping("/stock-movements")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @Autowired
    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @PostMapping
    public ResponseEntity<StockMovementDTO> createStockMovement(@RequestBody StockMovementDTO dto) {
        StockMovementDTO created = stockMovementService.createStockMovement(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockMovementDTO> getStockMovementById(@PathVariable Long id) {
        StockMovementDTO dto = stockMovementService.getStockMovementById(id);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    /**
     * Paginated list, newest first. Optional filters: warehouse, product, type, movement date range.
     */
    @GetMapping
    public ResponseEntity<Page<StockMovementDTO>> getStockMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) MovementType movementType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "movementDate"));
        return ResponseEntity.ok(
                stockMovementService.getStockMovements(pageable, warehouseId, productId, movementType, dateFrom, dateTo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StockMovementDTO> updateStockMovement(@PathVariable Long id, @RequestBody StockMovementDTO dto) {
        StockMovementDTO updated = stockMovementService.updateStockMovement(id, dto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStockMovement(@PathVariable Long id) {
        stockMovementService.deleteStockMovement(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
