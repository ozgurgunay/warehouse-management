package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.DeliveryReceiptDTO;
import com.example.warehousemanagement.dto.MarkShippedRequestDTO;
import com.example.warehousemanagement.dto.ShipmentDTO;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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


    /**
     * Paginated list with optional filters. Ship date bounds (when set) only match rows with a non-null shipped date.
     */
    @GetMapping
    public ResponseEntity<Page<ShipmentDTO>> getShipments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String carrier,
            @RequestParam(required = false) String tracking,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime shippedFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime shippedTo) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(
                shipmentService.getShipmentsPage(pageable, status, orderId, carrier, tracking, shippedFrom, shippedTo));
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

    // --- Lifecycle (real-world dispatch) ---

    /**
     * Hand carrier: mark as in transit and record tracking + shipped timestamp.
     */
    @PostMapping("/{id}/ship")
    public ResponseEntity<ShipmentDTO> markShipped(@PathVariable Long id, @Valid @RequestBody MarkShippedRequestDTO body) {
        ShipmentDTO updated = shipmentService.markAsShipped(
                id, body.getCarrier(), body.getTrackingNumber(), body.getShippedAt());
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    /**
     * Proof of delivery: receipt + consume inventory allocations for the order.
     */
    @PostMapping("/{id}/deliver")
    public ResponseEntity<ShipmentDTO> markDelivered(@PathVariable Long id, @Valid @RequestBody DeliveryReceiptDTO dto) {
        ShipmentDTO updated = shipmentService.markAsDelivered(id, dto);
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
