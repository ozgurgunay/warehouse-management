package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.DeliveryReceiptDTO;
import com.example.warehousemanagement.service.DeliveryReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/delivery-receipts")
public class DeliveryReceiptController {

    private final DeliveryReceiptService deliveryReceiptService;

    @Autowired
    public DeliveryReceiptController(DeliveryReceiptService deliveryReceiptService) {
        this.deliveryReceiptService = deliveryReceiptService;
    }


    @PostMapping
    public ResponseEntity<DeliveryReceiptDTO> createDeliveryReceipt(@RequestBody DeliveryReceiptDTO dto) {
        DeliveryReceiptDTO created = deliveryReceiptService.createDeliveryReceipt(dto);
        return ResponseEntity.ok(created);
    }


    @GetMapping("/{id}")
    public ResponseEntity<DeliveryReceiptDTO> getDeliveryReceiptById(@PathVariable Long id) {
        DeliveryReceiptDTO dto = deliveryReceiptService.getDeliveryReceiptById(id);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }


    @GetMapping
    public ResponseEntity<List<DeliveryReceiptDTO>> getAllDeliveryReceipts() {
        List<DeliveryReceiptDTO> receipts = deliveryReceiptService.getAllDeliveryReceipts();
        return ResponseEntity.ok(receipts);
    }



    @GetMapping("/by-shipment/{shipmentId}")
    public ResponseEntity<DeliveryReceiptDTO> getByShipment(@PathVariable Long shipmentId) {
        DeliveryReceiptDTO dto = deliveryReceiptService.getDeliveryReceiptByShipmentId(shipmentId);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }


    @PutMapping("/{id}")
    public ResponseEntity<DeliveryReceiptDTO> updateDeliveryReceipt(@PathVariable Long id, @RequestBody DeliveryReceiptDTO dto) {
        DeliveryReceiptDTO updated = deliveryReceiptService.updateDeliveryReceipt(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliveryReceipt(@PathVariable Long id) {
        boolean deleted = deliveryReceiptService.deleteDeliveryReceipt(id);
        if (deleted) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }



}
