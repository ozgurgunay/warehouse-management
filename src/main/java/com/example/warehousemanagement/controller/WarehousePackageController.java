package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.PackageItemDTO;
import com.example.warehousemanagement.dto.WarehousePackageDTO;
import com.example.warehousemanagement.service.WarehousePackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/packages")
public class WarehousePackageController {


    private final WarehousePackageService warehousePackageService;

    @Autowired
    public WarehousePackageController(WarehousePackageService warehousePackageService) {
        this.warehousePackageService = warehousePackageService;
    }


    // Create a new package
    @PostMapping
    public ResponseEntity<WarehousePackageDTO> createPackage(@RequestBody WarehousePackageDTO dto) {
        WarehousePackageDTO created = warehousePackageService.createWarehousePackage(dto);
        return ResponseEntity.ok(created);
    }

    // get all packages
    @GetMapping
    public ResponseEntity<List<WarehousePackageDTO>> getAllPackages() {
        List<WarehousePackageDTO> list = warehousePackageService.getAllPackages();
        return ResponseEntity.ok(list);
    }

    // het a package by ID
    @GetMapping("/{id}")
    public ResponseEntity<WarehousePackageDTO> getPackageById(@PathVariable Long id) {
        WarehousePackageDTO dto = warehousePackageService.getPackageById(id);
        return ResponseEntity.ok(dto);
    }

    // update a package
    @PutMapping("/{id}")
    public ResponseEntity<WarehousePackageDTO> updatePackage(@PathVariable Long id, @RequestBody WarehousePackageDTO dto) {
        WarehousePackageDTO updated = warehousePackageService.updateWarehousePackage(id, dto);
        return ResponseEntity.ok(updated);
    }

    // delete a package
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        warehousePackageService.deleteWarehousePackage(id);
        return ResponseEntity.noContent().build();
    }

    // add an item to a package
    @PostMapping("/{id}/add-item")
    public ResponseEntity<PackageItemDTO> addItemToPackage(
            @PathVariable Long id,
            @RequestBody PackageItemDTO itemDto) {
        PackageItemDTO created = warehousePackageService.addItemToPackage(id, itemDto);
        return ResponseEntity.ok(created);
    }

    // list items of a package
    @GetMapping("/{id}/items")
    public ResponseEntity<List<PackageItemDTO>> getItemsOfPackage(@PathVariable Long id) {
        List<PackageItemDTO> items = warehousePackageService.getItemsByPackageId(id);
        return ResponseEntity.ok(items);
    }


}
