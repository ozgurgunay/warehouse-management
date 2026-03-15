package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.QrCodeDTO;
import com.example.warehousemanagement.service.QrCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/qrcodes")
public class QrCodeController {


    private final QrCodeService qrCodeService;

    @Autowired
    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @PostMapping
    public ResponseEntity<QrCodeDTO> createQrCode(@RequestBody QrCodeDTO dto) {
        QrCodeDTO created = qrCodeService.createQrCode(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<QrCodeDTO>> getAllQrCodes() {
        return ResponseEntity.ok(qrCodeService.getAllQrCodes());
    }


    @GetMapping("/{id}")
    public ResponseEntity<QrCodeDTO> getQrCodeById(@PathVariable Long id) {
        QrCodeDTO dto = qrCodeService.getQrCodeById(id);
        return ResponseEntity.ok(dto);
    }


    @GetMapping("/find")
    public ResponseEntity<QrCodeDTO> getByCode(@RequestParam String code) {
        QrCodeDTO dto = qrCodeService.getQrCodeByCode(code);
        return ResponseEntity.ok(dto);
    }



    @PutMapping("/{id}")
    public ResponseEntity<QrCodeDTO> updateQrCode(@PathVariable Long id, @RequestBody QrCodeDTO dto) {
        QrCodeDTO updated = qrCodeService.updateQrCode(id, dto);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQrCode(@PathVariable Long id) {
        qrCodeService.deleteQrCode(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/by-product/{productId}")
    public ResponseEntity<QrCodeDTO> getQrCodeByProduct(@PathVariable Long productId) {
        QrCodeDTO dto = qrCodeService.getQrCodeByProductId(productId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/by-package/{packageId}")
    public ResponseEntity<QrCodeDTO> getQrCodeByPackage(@PathVariable Long packageId) {
        QrCodeDTO dto = qrCodeService.getQrCodeByPackageId(packageId);
        return ResponseEntity.ok(dto);
    }


}
