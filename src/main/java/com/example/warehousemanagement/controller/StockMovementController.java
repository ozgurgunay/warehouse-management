package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.StockMovementDTO;
import com.example.warehousemanagement.service.StockMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public ResponseEntity<List<StockMovementDTO>> getAllStockMovements() {
        List<StockMovementDTO> stockMovementDTOS = stockMovementService.getAllStockMovements();
        return new ResponseEntity<>(stockMovementDTOS, HttpStatus.OK);
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
