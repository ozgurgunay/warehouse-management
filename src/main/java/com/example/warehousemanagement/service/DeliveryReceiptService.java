package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.DeliveryReceiptDTO;
import com.example.warehousemanagement.entity.DeliveryReceipt;
import com.example.warehousemanagement.mapper.DeliveryReceiptMapper;
import com.example.warehousemanagement.repository.DeliveryReceiptRepository;
import com.example.warehousemanagement.repository.ShipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryReceiptService {

    private final DeliveryReceiptRepository deliveryReceiptRepository;
    private final DeliveryReceiptMapper deliveryReceiptMapper;
    private final ShipmentRepository shipmentRepository;

    @Autowired
    public DeliveryReceiptService(
            DeliveryReceiptRepository deliveryReceiptRepository,
            DeliveryReceiptMapper deliveryReceiptMapper,
            ShipmentRepository shipmentRepository
    ) {
        this.deliveryReceiptRepository = deliveryReceiptRepository;
        this.deliveryReceiptMapper = deliveryReceiptMapper;
        this.shipmentRepository = shipmentRepository;
    }



    public DeliveryReceiptDTO createDeliveryReceipt(DeliveryReceiptDTO dto) {
        DeliveryReceipt receipt = deliveryReceiptMapper.deliveryReceiptDTOToDeliveryReceipt(dto);
        // Set the related shipment
        if (dto.getShipmentId() != null) {
            receipt.setShipment(shipmentRepository.findById(dto.getShipmentId()).orElse(null));
        }
        // Set deliveredAt if not provided
        if (receipt.getDeliveredAt() == null) {
            receipt.setDeliveredAt(LocalDateTime.now());
        }
        return deliveryReceiptMapper.deliveryReceiptToDeliveryReceiptDTO(
                deliveryReceiptRepository.save(receipt));
    }


    public DeliveryReceiptDTO getDeliveryReceiptById(Long id) {
        return deliveryReceiptRepository.findById(id)
                .map(deliveryReceiptMapper::deliveryReceiptToDeliveryReceiptDTO)
                .orElse(null);
    }


    public DeliveryReceiptDTO getDeliveryReceiptByShipmentId(Long shipmentId) {
        DeliveryReceipt receipt = deliveryReceiptRepository.findByShipmentId(shipmentId);
        return receipt != null ? deliveryReceiptMapper.deliveryReceiptToDeliveryReceiptDTO(receipt) : null;
    }


    public List<DeliveryReceiptDTO> getAllDeliveryReceipts() {
        return deliveryReceiptRepository.findAll()
                .stream()
                .map(deliveryReceiptMapper::deliveryReceiptToDeliveryReceiptDTO)
                .collect(Collectors.toList());
    }



    public DeliveryReceiptDTO updateDeliveryReceipt(Long id, DeliveryReceiptDTO dto) {
        return deliveryReceiptRepository.findById(id).map(existing -> {
            existing.setReceiverName(dto.getReceiverName());
            existing.setReceiverPhone(dto.getReceiverPhone());
            existing.setDeliveryNote(dto.getDeliveryNote());
            existing.setDeliveredAt(dto.getDeliveredAt() != null ? dto.getDeliveredAt() : existing.getDeliveredAt());
            return deliveryReceiptMapper.deliveryReceiptToDeliveryReceiptDTO(
                    deliveryReceiptRepository.save(existing));
        }).orElse(null);
    }



    public boolean deleteDeliveryReceipt(Long id) {
        if (deliveryReceiptRepository.existsById(id)) {
            deliveryReceiptRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
