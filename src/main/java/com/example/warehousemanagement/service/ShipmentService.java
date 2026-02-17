package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.DeliveryReceiptDTO;
import com.example.warehousemanagement.dto.ShipmentDTO;
import com.example.warehousemanagement.entity.DeliveryReceipt;
import com.example.warehousemanagement.entity.Shipment;
import com.example.warehousemanagement.entity.WarehousePackage;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.mapper.ShipmentMapper;
import com.example.warehousemanagement.repository.DeliveryReceiptRepository;
import com.example.warehousemanagement.repository.OrderRepository;
import com.example.warehousemanagement.repository.ShipmentRepository;
import com.example.warehousemanagement.repository.WarehousePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentMapper shipmentMapper;
    private final OrderRepository orderRepository;
    private final DeliveryReceiptRepository deliveryReceiptRepository;
    private final WarehousePackageRepository warehousePackageRepository;

    @Autowired
    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentMapper shipmentMapper,
            OrderRepository orderRepository,
            DeliveryReceiptRepository deliveryReceiptRepository,
            WarehousePackageRepository warehousePackageRepository
    ) {
        this.shipmentRepository = shipmentRepository;
        this.shipmentMapper = shipmentMapper;
        this.orderRepository = orderRepository;
        this.deliveryReceiptRepository = deliveryReceiptRepository;
        this.warehousePackageRepository = warehousePackageRepository;
    }


    /**
     * creates a shipment for a specific order. Status is set to PENDING
     */
    public ShipmentDTO createShipment(ShipmentDTO dto) {
        Shipment shipment = shipmentMapper.shipmentDTOToShipment(dto);
        if (dto.getOrderId() != null)
            shipment.setOrder(orderRepository.findById(dto.getOrderId()).orElse(null));
        shipment.setStatus(ShipmentStatus.PENDING);
        shipment.setShippedDate(null);
        shipment.setDeliveredDate(null);
        return shipmentMapper.shipmentToShipmentDTO(shipmentRepository.save(shipment));
    }

    public List<ShipmentDTO> getAllShipments() {
        return shipmentRepository.findAll()
                .stream().map(shipmentMapper::shipmentToShipmentDTO)
                .collect(Collectors.toList());
    }

    public ShipmentDTO getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .map(shipmentMapper::shipmentToShipmentDTO)
                .orElse(null);
    }


    /* marks a shipment as shipped, sets tracking info, shipped date, and updates related order's shipment status */
    public ShipmentDTO markAsShipped(Long shipmentId, String carrier, String trackingNumber, LocalDateTime shippedDate) {
        return shipmentRepository.findById(shipmentId).map(shipment -> {
            shipment.setStatus(ShipmentStatus.IN_TRANSIT);
            shipment.setCarrier(carrier);
            shipment.setTrackingNumber(trackingNumber);
            shipment.setShippedDate(shippedDate);
            // update the order's shipment status
            if (shipment.getOrder() != null) {
                shipment.getOrder().setShipmentStatus(ShipmentStatus.IN_TRANSIT);
                orderRepository.save(shipment.getOrder());
            }
            return shipmentMapper.shipmentToShipmentDTO(shipmentRepository.save(shipment));
        }).orElse(null);
    }


    public ShipmentDTO markAsDelivered(Long shipmentId, DeliveryReceiptDTO deliveryReceiptDTO) {
        return shipmentRepository.findById(shipmentId).map(shipment -> {
            shipment.setStatus(ShipmentStatus.DELIVERED);
            shipment.setDeliveredDate(deliveryReceiptDTO.getDeliveredAt());
            // Create and save delivery receipt
            DeliveryReceipt receipt = new DeliveryReceipt();
            receipt.setShipment(shipment);
            receipt.setReceiverName(deliveryReceiptDTO.getReceiverName());
            receipt.setReceiverPhone(deliveryReceiptDTO.getReceiverPhone());
            receipt.setDeliveryNote(deliveryReceiptDTO.getDeliveryNote());
            receipt.setDeliveredAt(deliveryReceiptDTO.getDeliveredAt());
            deliveryReceiptRepository.save(receipt);
            shipment.setDeliveryReceipt(receipt);
            // Optionally: Update order's shipment status
            if (shipment.getOrder() != null) {
                shipment.getOrder().setShipmentStatus(ShipmentStatus.DELIVERED);
                orderRepository.save(shipment.getOrder());
            }
            return shipmentMapper.shipmentToShipmentDTO(shipmentRepository.save(shipment));
        }).orElse(null);
    }



    public ShipmentDTO getShipmentByTrackingNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber);
        return shipment != null ? shipmentMapper.shipmentToShipmentDTO(shipment) : null;
    }


    public List<ShipmentDTO> getShipmentsByOrderId(Long orderId) {
        return shipmentRepository.findByOrderId(orderId)
                .stream()
                .map(shipmentMapper::shipmentToShipmentDTO)
                .collect(Collectors.toList());
    }



    public ShipmentDTO addWarehousePackageToShipment(Long shipmentId, Long warehousePackageId) {
        Shipment shipment = shipmentRepository.findById(shipmentId).orElse(null);
        WarehousePackage warehousePackage = warehousePackageRepository.findById(warehousePackageId).orElse(null);
        if (shipment != null && warehousePackage != null) {
            warehousePackage.setShipment(shipment);
            warehousePackageRepository.save(warehousePackage);
            // optional-refresh and return updated shipment
            return shipmentMapper.shipmentToShipmentDTO(shipmentRepository.findById(shipmentId).orElse(shipment));
        }
        return null;
    }



    public ShipmentDTO updateShipment(Long id, ShipmentDTO dto) {
        return shipmentRepository.findById(id).map(existing -> {
            existing.setShippingAddress(dto.getShippingAddress());
            existing.setEstimatedArrivalDate(dto.getEstimatedArrivalDate());
            existing.setShipmentCost(dto.getShipmentCost());
            existing.setShippingMethod(dto.getShippingMethod());
            existing.setShippingMethodDescription(dto.getShippingMethodDescription());
            // optionally, update barcode and qrCode
            existing.setBarcode(dto.getBarcode());
            existing.setQrCode(dto.getQrCode());
            return shipmentMapper.shipmentToShipmentDTO(shipmentRepository.save(existing));
        }).orElse(null);
    }


    public ShipmentDTO getShipment(Long id) {
        return shipmentRepository.findById(id)
                .map(shipmentMapper::shipmentToShipmentDTO)
                .orElse(null);
    }


    // Update status (for PATCH endpoint)
    public ShipmentDTO updateShipmentStatus(Long id, ShipmentStatus status) {
        return shipmentRepository.findById(id).map(existing -> {
            existing.setStatus(status);
            // Optionally update related order's shipment status
            if (existing.getOrder() != null) {
                existing.getOrder().setShipmentStatus(status);
                orderRepository.save(existing.getOrder());
            }
            return shipmentMapper.shipmentToShipmentDTO(shipmentRepository.save(existing));
        }).orElse(null);
    }


    public boolean deleteShipment(Long id) {
        if (shipmentRepository.existsById(id)) {
            shipmentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // find shipment by barcode or qrCode
    public ShipmentDTO findByBarcode(String barcode) {
        Shipment shipment = shipmentRepository.findByBarcode(barcode);
        return shipment != null ? shipmentMapper.shipmentToShipmentDTO(shipment) : null;
    }

    public ShipmentDTO findByQrCode(String qrCode) {
        Shipment shipment = shipmentRepository.findByQrCode(qrCode);
        return shipment != null ? shipmentMapper.shipmentToShipmentDTO(shipment) : null;
    }


}
