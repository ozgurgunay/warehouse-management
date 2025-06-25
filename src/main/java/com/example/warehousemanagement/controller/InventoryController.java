package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.InventoryDTO;
import com.example.warehousemanagement.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    @Autowired
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    public ResponseEntity<InventoryDTO> createInventory(@RequestBody InventoryDTO dto) {
        InventoryDTO created = inventoryService.createInventory(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO> getInventoryById(@PathVariable Long id) {
        InventoryDTO dto = inventoryService.getInventoryById(id);
        return dto != null ? new ResponseEntity<>(dto, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping
    public ResponseEntity<List<InventoryDTO>> getAllInventories() {
        List<InventoryDTO> inventoryDTOS = inventoryService.getAllInventories();
        return new ResponseEntity<>(inventoryDTOS, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryDTO> updateInventory(@PathVariable Long id, @RequestBody InventoryDTO dto) {
        InventoryDTO updated = inventoryService.updateInventory(id, dto);
        return updated != null ? new ResponseEntity<>(updated, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        boolean deleted = inventoryService.deleteInventory(id);
        return deleted ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
