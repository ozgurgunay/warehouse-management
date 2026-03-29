package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.DeliveryReceiptDTO;
import com.example.warehousemanagement.dto.ShipmentDTO;
import com.example.warehousemanagement.entity.DeliveryReceipt;
import com.example.warehousemanagement.entity.Shipment;
import com.example.warehousemanagement.entity.WarehousePackage;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.ShipmentMapper;
import com.example.warehousemanagement.repository.DeliveryReceiptRepository;
import com.example.warehousemanagement.repository.OrderRepository;
import com.example.warehousemanagement.repository.ShipmentRepository;
import com.example.warehousemanagement.repository.WarehousePackageRepository;
import com.example.warehousemanagement.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final InventoryAllocationService inventoryAllocationService;

    @Autowired
    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentMapper shipmentMapper,
            OrderRepository orderRepository,
            DeliveryReceiptRepository deliveryReceiptRepository,
            WarehousePackageRepository warehousePackageRepository,
            InventoryAllocationService inventoryAllocationService
    ) {
        this.shipmentRepository = shipmentRepository;
        this.shipmentMapper = shipmentMapper;
        this.orderRepository = orderRepository;
        this.deliveryReceiptRepository = deliveryReceiptRepository;
        this.warehousePackageRepository = warehousePackageRepository;
        this.inventoryAllocationService = inventoryAllocationService;
    }


    /**
     * creates a shipment for a specific order. Status is set to PENDING
     */
    @Transactional
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

    /**
     * Paginated list with filters; newest shipment id first. Carrier/tracking use case-insensitive substring match.
     */
    @Transactional(readOnly = true)
    public Page<ShipmentDTO> getShipmentsPage(
            Pageable pageable,
            ShipmentStatus status,
            Long orderId,
            String carrier,
            String tracking,
            LocalDateTime shippedFrom,
            LocalDateTime shippedTo) {
        String c = (carrier != null && !carrier.isBlank()) ? carrier.trim() : null;
        String t = (tracking != null && !tracking.isBlank()) ? tracking.trim() : null;
        String statusName = status != null ? status.name() : null;
        return shipmentRepository
                .search(statusName, orderId, c, t, shippedFrom, shippedTo, pageable)
                .map(shipmentMapper::shipmentToShipmentDTO);
    }

    public ShipmentDTO getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .map(shipmentMapper::shipmentToShipmentDTO)
                .orElseThrow(() -> new NotFoundException("Shipment not found with id: " + id));
    }


    /* marks a shipment as shipped, sets tracking info, shipped date, and updates related order's shipment status */
    @Transactional
    public ShipmentDTO markAsShipped(Long shipmentId, String carrier, String trackingNumber, LocalDateTime shippedDate) {
        return shipmentRepository.findById(shipmentId).map(shipment -> {
            if (shipment.getStatus() == ShipmentStatus.DELIVERED || shipment.getStatus() == ShipmentStatus.CANCELLED) {
                throw new BusinessException("Cannot ship a shipment that is already delivered or cancelled.");
            }
            if (shipment.getStatus() == ShipmentStatus.RETURNED) {
                throw new BusinessException("Cannot ship a returned shipment.");
            }
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
        }).orElseThrow(() -> new NotFoundException("Shipment not found with id: " + shipmentId));
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
                // Consume inventory allocations for this order when shipment is delivered
                inventoryAllocationService.consumeAllocationsForOrder(shipment.getOrder().getId());
            }
            return shipmentMapper.shipmentToShipmentDTO(shipmentRepository.save(shipment));
        }).orElseThrow(() -> new NotFoundException("Shipment not found with id: " + shipmentId));
    }



    public ShipmentDTO getShipmentByTrackingNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber);
        if (shipment == null) {
            throw new NotFoundException("Shipment not found with tracking number: " + trackingNumber);
        }
        return shipmentMapper.shipmentToShipmentDTO(shipment);
    }


    public List<ShipmentDTO> getShipmentsByOrderId(Long orderId) {
        return shipmentRepository.findByOrder_Id(orderId)
                .stream()
                .map(shipmentMapper::shipmentToShipmentDTO)
                .collect(Collectors.toList());
    }



    public ShipmentDTO addWarehousePackageToShipment(Long shipmentId, Long warehousePackageId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new NotFoundException("Shipment not found with id: " + shipmentId));
        WarehousePackage warehousePackage = warehousePackageRepository.findById(warehousePackageId)
                .orElseThrow(() -> new NotFoundException("Warehouse package not found with id: " + warehousePackageId));

        warehousePackage.setShipment(shipment);
        warehousePackageRepository.save(warehousePackage);
        // Refresh and return updated shipment
        Shipment reloaded = shipmentRepository.findById(shipmentId).orElse(shipment);
        return shipmentMapper.shipmentToShipmentDTO(reloaded);
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
        }).orElseThrow(() -> new NotFoundException("Shipment not found with id: " + id));
    }


    public ShipmentDTO getShipment(Long id) {
        return shipmentRepository.findById(id)
                .map(shipmentMapper::shipmentToShipmentDTO)
                .orElseThrow(() -> new NotFoundException("Shipment not found with id: " + id));
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
        }).orElseThrow(() -> new NotFoundException("Shipment not found with id: " + id));
    }


    public void deleteShipment(Long id) {
        if (!shipmentRepository.existsById(id)) {
            throw new NotFoundException("Shipment not found with id: " + id);
        }
        shipmentRepository.deleteById(id);
    }

    // find shipment by barcode or qrCode
    public ShipmentDTO findByBarcode(String barcode) {
        Shipment shipment = shipmentRepository.findByBarcode(barcode);
        if (shipment == null) {
            throw new NotFoundException("Shipment not found with barcode: " + barcode);
        }
        return shipmentMapper.shipmentToShipmentDTO(shipment);
    }

    public ShipmentDTO findByQrCode(String qrCode) {
        Shipment shipment = shipmentRepository.findByQrCode(qrCode);
        if (shipment == null) {
            throw new NotFoundException("Shipment not found with QR code: " + qrCode);
        }
        return shipmentMapper.shipmentToShipmentDTO(shipment);
    }


}
