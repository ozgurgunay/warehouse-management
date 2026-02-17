package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.BarcodeDTO;
import com.example.warehousemanagement.entity.Barcode;
import com.example.warehousemanagement.mapper.BarcodeMapper;
import com.example.warehousemanagement.repository.BarcodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BarcodeService {

    private final BarcodeRepository barcodeRepository;
    private final BarcodeMapper barcodeMapper;

    @Autowired
    public BarcodeService(
            BarcodeRepository barcodeRepository,
            BarcodeMapper barcodeMapper
    ) {
        this.barcodeRepository = barcodeRepository;
        this.barcodeMapper = barcodeMapper;
    }

    /**
     * creates a new barcode (e.g., for a product, package, shipment, etc.)
     */
    public BarcodeDTO createBarcode(BarcodeDTO dto) {
        Barcode barcode = barcodeMapper.barcodeDTOToBarcode(dto);
        barcode.setCreatedAt(LocalDateTime.now());
        return barcodeMapper.barcodeToBarcodeDTO(barcodeRepository.save(barcode));
    }

    /**
     * gets barcode by string code
     */
    public BarcodeDTO getBarcodeByCode(String code) {
        Barcode barcode = barcodeRepository.findByCode(code);
        return barcode != null ? barcodeMapper.barcodeToBarcodeDTO(barcode) : null;
    }

    /**
     * returns all barcodes (for admin/reporting)
     */
    public List<BarcodeDTO> getAllBarcodes() {
        return barcodeRepository.findAll()
                .stream()
                .map(barcodeMapper::barcodeToBarcodeDTO)
                .collect(Collectors.toList());
    }

    /**
     * updates barcode information (rare in real world, but may be needed for correction
     */
    public BarcodeDTO updateBarcode(Long id, BarcodeDTO dto) {
        return barcodeRepository.findById(id).map(existing -> {
            existing.setCode(dto.getCode());
            existing.setAssignedToType(dto.getAssignedToType());
            existing.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : existing.getCreatedAt());
            return barcodeMapper.barcodeToBarcodeDTO(barcodeRepository.save(existing));
        }).orElse(null);
    }

    /**
     * deletes a barcode by id
     */
    public boolean deleteBarcode(Long id) {
        if (barcodeRepository.existsById(id)) {
            barcodeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Real world: assign a barcode to an entity (product, package, etc.)
    // This would require business logic (e.g., updating Product or WarehousePackage and setting their barcode)
    // Example: assignBarcodeToProduct(Long barcodeId, Long productId)
    //          assignBarcodeToWarehousePackage(Long barcodeId, Long packageId)

}
