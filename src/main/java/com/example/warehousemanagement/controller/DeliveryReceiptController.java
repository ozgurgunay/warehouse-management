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
        return ResponseEntity.ok(dto);
    }


    @GetMapping
    public ResponseEntity<List<DeliveryReceiptDTO>> getAllDeliveryReceipts() {
        List<DeliveryReceiptDTO> receipts = deliveryReceiptService.getAllDeliveryReceipts();
        return ResponseEntity.ok(receipts);
    }



    @GetMapping("/by-shipment/{shipmentId}")
    public ResponseEntity<DeliveryReceiptDTO> getByShipment(@PathVariable Long shipmentId) {
        DeliveryReceiptDTO dto = deliveryReceiptService.getDeliveryReceiptByShipmentId(shipmentId);
        return ResponseEntity.ok(dto);
    }


    @PutMapping("/{id}")
    public ResponseEntity<DeliveryReceiptDTO> updateDeliveryReceipt(@PathVariable Long id, @RequestBody DeliveryReceiptDTO dto) {
        DeliveryReceiptDTO updated = deliveryReceiptService.updateDeliveryReceipt(id, dto);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliveryReceipt(@PathVariable Long id) {
        deliveryReceiptService.deleteDeliveryReceipt(id);
        return ResponseEntity.noContent().build();
    }



}
