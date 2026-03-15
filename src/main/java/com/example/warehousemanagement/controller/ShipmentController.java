package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.ShipmentDTO;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.service.ShipmentService;
import jakarta.validation.Valid;
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
    public ResponseEntity<ShipmentDTO> createShipment(@Valid @RequestBody ShipmentDTO dto) {
        ShipmentDTO created = shipmentService.createShipment(dto);
        return ResponseEntity.ok(created);
    }


    @GetMapping
    public ResponseEntity<List<ShipmentDTO>> getAllShipments(
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) Long orderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<ShipmentDTO> list = shipmentService.getShipments(status, orderId, page, size);
        return ResponseEntity.ok(list);
    }


    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDTO> getShipmentById(@PathVariable Long id) {
        ShipmentDTO dto = shipmentService.getShipmentById(id);
        return ResponseEntity.ok(dto);
    }


    @PutMapping("/{id}")
    public ResponseEntity<ShipmentDTO> updateShipment(@PathVariable Long id, @RequestBody ShipmentDTO dto) {
        ShipmentDTO updated = shipmentService.updateShipment(id, dto);
        return ResponseEntity.ok(updated);
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.noContent().build();
    }



    @PatchMapping("/{id}/status")
    public ResponseEntity<ShipmentDTO> updateShipmentStatus(
            @PathVariable Long id,
            @RequestParam ShipmentStatus status) {
        ShipmentDTO updated = shipmentService.updateShipmentStatus(id, status);
        return ResponseEntity.ok(updated);
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
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/by-qrcode/{qrcode}")
    public ResponseEntity<ShipmentDTO> getShipmentByQrCode(@PathVariable String qrcode) {
        ShipmentDTO dto = shipmentService.findByQrCode(qrcode);
        return ResponseEntity.ok(dto);
    }

}
