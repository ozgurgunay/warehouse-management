package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.PackageItemDTO;
import com.example.warehousemanagement.service.PackageItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/package-items")
public class PackageItemController {


    private final PackageItemService packageItemService;

    @Autowired
    public PackageItemController(PackageItemService packageItemService) {
        this.packageItemService = packageItemService;
    }

    // Create (add) a package item
    @PostMapping
    public ResponseEntity<PackageItemDTO> createPackageItem(@RequestBody PackageItemDTO dto) {
        PackageItemDTO created = packageItemService.addPackageItem(dto);
        return ResponseEntity.ok(created);
    }

    // Update a package item
    @PutMapping("/{id}")
    public ResponseEntity<PackageItemDTO> updatePackageItem(@PathVariable Long id, @RequestBody PackageItemDTO dto) {
        PackageItemDTO updated = packageItemService.updatePackageItem(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    // Delete a package item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackageItem(@PathVariable Long id) {
        boolean deleted = packageItemService.deletePackageItem(id);
        if (deleted) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    // Get all items for a package
    @GetMapping("/by-package/{packageId}")
    public ResponseEntity<List<PackageItemDTO>> getItemsByPackage(@PathVariable Long packageId) {
        List<PackageItemDTO> items = packageItemService.getPackageItemsByPackage(packageId);
        return ResponseEntity.ok(items);
    }

    // Get single package item by ID
    @GetMapping("/{id}")
    public ResponseEntity<PackageItemDTO> getPackageItem(@PathVariable Long id) {
        PackageItemDTO dto = packageItemService.getPackageItem(id);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    // find package item by barcode or qrCode. I need to add service methods!!
    /**
    @GetMapping("/by-barcode/{barcode}")
    public ResponseEntity<PackageItemDTO> getPackageItemByBarcode(@PathVariable String barcode) {
        PackageItemDTO dto = packageItemService.findByBarcode(barcode);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }


    @GetMapping("/by-qrcode/{qrcode}")
    public ResponseEntity<PackageItemDTO> getPackageItemByQrCode(@PathVariable String qrcode) {
        PackageItemDTO dto = packageItemService.findByQrCode(qrcode);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }
    */

}
