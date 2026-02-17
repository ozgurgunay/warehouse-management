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


    // create new package
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
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    // update a package
    @PutMapping("/{id}")
    public ResponseEntity<WarehousePackageDTO> updatePackage(@PathVariable Long id, @RequestBody WarehousePackageDTO dto) {
        WarehousePackageDTO updated = warehousePackageService.updateWarehousePackage(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    // delete a package
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        boolean deleted = warehousePackageService.deleteWarehousePackage(id);
        if (deleted) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    // add an item to a package
    @PostMapping("/{id}/add-item")
    public ResponseEntity<PackageItemDTO> addItemToPackage(
            @PathVariable Long id,
            @RequestBody PackageItemDTO itemDto) {
        PackageItemDTO created = warehousePackageService.addItemToPackage(id, itemDto);
        if (created != null) return ResponseEntity.ok(created);
        return ResponseEntity.badRequest().build();
    }

    // list items of a package
    @GetMapping("/{id}/items")
    public ResponseEntity<List<PackageItemDTO>> getItemsOfPackage(@PathVariable Long id) {
        List<PackageItemDTO> items = warehousePackageService.getItemsByPackageId(id);
        return ResponseEntity.ok(items);
    }


}
