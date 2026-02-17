package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.BarcodeDTO;
import com.example.warehousemanagement.service.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/barcodes")
public class BarcodeController {

    private final BarcodeService barcodeService;

    @Autowired
    public BarcodeController(BarcodeService barcodeService) {
        this.barcodeService = barcodeService;
    }

    @PostMapping
    public ResponseEntity<BarcodeDTO> createBarcode(@RequestBody BarcodeDTO dto) {
        BarcodeDTO created = barcodeService.createBarcode(dto);
        return ResponseEntity.ok(created);
    }


    @GetMapping
    public ResponseEntity<List<BarcodeDTO>> getAllBarcodes() {
        return ResponseEntity.ok(barcodeService.getAllBarcodes());
    }


    @GetMapping("/{id}")
    public ResponseEntity<BarcodeDTO> getBarcodeById(@PathVariable Long id) {
        BarcodeDTO dto = barcodeService.getAllBarcodes().stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .orElse(null);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }


    @GetMapping("/find")
    public ResponseEntity<BarcodeDTO> getByCode(@RequestParam String code) {
        BarcodeDTO dto = barcodeService.getBarcodeByCode(code);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }


    @PutMapping("/{id}")
    public ResponseEntity<BarcodeDTO> updateBarcode(@PathVariable Long id, @RequestBody BarcodeDTO dto) {
        BarcodeDTO updated = barcodeService.updateBarcode(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBarcode(@PathVariable Long id) {
        boolean deleted = barcodeService.deleteBarcode(id);
        if (deleted) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }


    //possible to add set barcode methods for product, package, etc.

}
