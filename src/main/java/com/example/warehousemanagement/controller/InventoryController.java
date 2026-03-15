package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.InventoryDTO;
import com.example.warehousemanagement.dto.InventoryStatusChangeRequestDTO;
import com.example.warehousemanagement.entity.enums.InventoryStatus;
import com.example.warehousemanagement.service.InventoryService;
import jakarta.validation.Valid;
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
    public ResponseEntity<InventoryDTO> createInventory(@Valid @RequestBody InventoryDTO dto) {
        InventoryDTO created = inventoryService.createInventory(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO> getInventoryById(@PathVariable Long id) {
        InventoryDTO dto = inventoryService.getInventoryById(id);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<InventoryDTO>> getAllInventories(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) InventoryStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<InventoryDTO> inventoryDTOS =
                inventoryService.getInventories(productId, warehouseId, status, page, size);
        return new ResponseEntity<>(inventoryDTOS, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryDTO> updateInventory(@PathVariable Long id, @Valid @RequestBody InventoryDTO dto) {
        InventoryDTO updated = inventoryService.updateInventory(id, dto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PatchMapping("/status")
    public ResponseEntity<Void> changeInventoryStatus(@Valid @RequestBody InventoryStatusChangeRequestDTO request) {

        inventoryService.changeInventoryStatus(
                request.getInventoryId(),
                request.getAmount(),
                request.getTargetStatus()
        );

        // successful  (200 OK)
        return ResponseEntity.ok().build();
    }

}
