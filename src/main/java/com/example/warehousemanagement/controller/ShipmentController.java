package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.ShipmentDTO;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    @Autowired
    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }


    @PostMapping
    public ResponseEntity<ShipmentDTO> createShipment(@RequestBody ShipmentDTO dto) {
        ShipmentDTO created = shipmentService.createShipment(dto);
        return ResponseEntity.ok(created);
    }


    @GetMapping
    public ResponseEntity<List<ShipmentDTO>> getAllShipments() {
        List<ShipmentDTO> list = shipmentService.getAllShipments();
        return ResponseEntity.ok(list);
    }


    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDTO> getShipmentById(@PathVariable Long id) {
        ShipmentDTO dto = shipmentService.getShipmentById(id);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }


    @PutMapping("/{id}")
    public ResponseEntity<ShipmentDTO> updateShipment(@PathVariable Long id, @RequestBody ShipmentDTO dto) {
        ShipmentDTO updated = shipmentService.updateShipment(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShipment(@PathVariable Long id) {
        boolean deleted = shipmentService.deleteShipment(id);
        if (deleted) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }



    @PatchMapping("/{id}/status")
    public ResponseEntity<ShipmentDTO> updateShipmentStatus(
            @PathVariable Long id,
            @RequestParam ShipmentStatus status) {
        ShipmentDTO updated = shipmentService.updateShipmentStatus(id, status);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }


    @GetMapping("/by-order/{orderId}")
    public ResponseEntity<List<ShipmentDTO>> getShipmentsByOrderId(@PathVariable Long orderId) {
        List<ShipmentDTO> list = shipmentService.getShipmentsByOrderId(orderId);
        return ResponseEntity.ok(list);
    }

    // search shipment by barcode or qrcode
    @GetMapping("/by-barcode/{barcode}")
    public ResponseEntity<ShipmentDTO> getShipmentByBarcode(@PathVariable String barcode) {
        ShipmentDTO dto = shipmentService.findByBarcode(barcode);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/by-qrcode/{qrcode}")
    public ResponseEntity<ShipmentDTO> getShipmentByQrCode(@PathVariable String qrcode) {
        ShipmentDTO dto = shipmentService.findByQrCode(qrcode);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

}
