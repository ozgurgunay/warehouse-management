package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.WarehouseDTO;
import com.example.warehousemanagement.dto.WarehouseStatsDTO;
import com.example.warehousemanagement.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @Autowired
    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @PostMapping
    public ResponseEntity<WarehouseDTO> createWarehouse(@RequestBody WarehouseDTO dto) {
        WarehouseDTO created = warehouseService.createWarehouse(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /** Must be registered before GET /{id} so "stats" is not parsed as an id. */
    @GetMapping("/stats")
    public ResponseEntity<WarehouseStatsDTO> getWarehouseStats() {
        return new ResponseEntity<>(warehouseService.getWarehouseStats(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseDTO> getWarehouseById(@PathVariable Long id) {
        WarehouseDTO dto = warehouseService.getWarehouseById(id);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<WarehouseDTO>> getAllWarehouses() {
        List<WarehouseDTO> warehouseDTOS = warehouseService.getAllWarehouses();
        return new ResponseEntity<>(warehouseDTOS, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseDTO> updateWarehouse(@PathVariable Long id, @RequestBody WarehouseDTO dto) {
        WarehouseDTO updated = warehouseService.updateWarehouse(id, dto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


}
