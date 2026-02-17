package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.QrCodeDTO;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.entity.QrCode;
import com.example.warehousemanagement.entity.WarehousePackage;
import com.example.warehousemanagement.mapper.QrCodeMapper;
import com.example.warehousemanagement.repository.ProductRepository;
import com.example.warehousemanagement.repository.QrCodeRepository;
import com.example.warehousemanagement.repository.WarehousePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QrCodeService {

    private final QrCodeRepository qrCodeRepository;
    private final QrCodeMapper qrCodeMapper;
    private final ProductRepository productRepository;
    private final WarehousePackageRepository warehousePackageRepository;

    @Autowired
    public QrCodeService(
            QrCodeRepository qrCodeRepository,
            QrCodeMapper qrCodeMapper,
            ProductRepository productRepository,
            WarehousePackageRepository warehousePackageRepository
    ) {
        this.qrCodeRepository = qrCodeRepository;
        this.qrCodeMapper = qrCodeMapper;
        this.productRepository = productRepository;
        this.warehousePackageRepository = warehousePackageRepository;
    }


    /**
     * creates a new QR code (can be assigned to a product, package, etc.)
     */
    public QrCodeDTO createQrCode(QrCodeDTO dto) {
        QrCode qrCode = qrCodeMapper.qrCodeDTOToQrCodeEntity(dto);
        qrCode.setCreatedAt(LocalDateTime.now());
        return qrCodeMapper.qrCodeToQrCodeDTO(qrCodeRepository.save(qrCode));
    }

    public QrCodeDTO assignQrCodeToProduct(Long qrCodeId, Long productId) {
        QrCode qrCode = qrCodeRepository.findById(qrCodeId).orElse(null);
        if (qrCode == null) return null;
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return null;
        product.setQrCode(qrCode);
        productRepository.save(product);
        // qrCode.setProduct(product)
        return qrCodeMapper.qrCodeToQrCodeDTO(qrCode);
    }

    public QrCodeDTO assignQrCodeToWarehousePackage(Long qrCodeId, Long packageId) {
        QrCode qrCode = qrCodeRepository.findById(qrCodeId).orElse(null);
        if (qrCode == null) return null;
        WarehousePackage warehousePackage = warehousePackageRepository.findById(packageId).orElse(null);
        if (warehousePackage == null) return null;
        warehousePackage.setQrCode(qrCode);
        warehousePackageRepository.save(warehousePackage);
        return qrCodeMapper.qrCodeToQrCodeDTO(qrCode);
    }

    /**
     * gets a QR code by code string
     */
    public QrCodeDTO getQrCodeByCode(String code) {
        QrCode qrCode = qrCodeRepository.findByCode(code);
        return qrCode != null ? qrCodeMapper.qrCodeToQrCodeDTO(qrCode) : null;
    }

    public QrCodeDTO getQrCodeByProductId(Long productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null && product.getQrCode() != null) {
            return qrCodeMapper.qrCodeToQrCodeDTO(product.getQrCode());
        }
        return null;
    }

    public QrCodeDTO getQrCodeByPackageId(Long packageId) {
        WarehousePackage pkg = warehousePackageRepository.findById(packageId).orElse(null);
        if (pkg != null && pkg.getQrCode() != null) {
            return qrCodeMapper.qrCodeToQrCodeDTO(pkg.getQrCode());
        }
        return null;
    }

    /**
     * returns all QR codes (for admin/reporting)
     */
    public List<QrCodeDTO> getAllQrCodes() {
        return qrCodeRepository.findAll()
                .stream()
                .map(qrCodeMapper::qrCodeToQrCodeDTO)
                .collect(Collectors.toList());
    }

    public QrCodeDTO getQrCodeById(Long id) {
        return qrCodeRepository.findById(id)
                .map(qrCodeMapper::qrCodeToQrCodeDTO)
                .orElse(null);
    }





    /**
     * updates QR code information (rare, but can be useful for corrections)
     */
    public QrCodeDTO updateQrCode(Long id, QrCodeDTO dto) {
        return qrCodeRepository.findById(id).map(existing -> {
            existing.setCode(dto.getCode());
            existing.setAssignedToType(dto.getAssignedToType());
            existing.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : existing.getCreatedAt());
            return qrCodeMapper.qrCodeToQrCodeDTO(qrCodeRepository.save(existing));
        }).orElse(null);
    }

    /**
     * deletes a QR code by id
     */
    public boolean deleteQrCode(Long id) {
        if (qrCodeRepository.existsById(id)) {
            qrCodeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // assign QR code to an entity (product, package, etc.)
    // add business methods like:
    // assignQrCodeToProduct(Long qrCodeId, Long productId)
    // assignQrCodeToWarehousePackage(Long qrCodeId, Long packageId)

    
}
