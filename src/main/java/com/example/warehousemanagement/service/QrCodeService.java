package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.QrCodeDTO;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.entity.QrCode;
import com.example.warehousemanagement.entity.WarehousePackage;
import com.example.warehousemanagement.exception.NotFoundException;
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
        QrCode qrCode = qrCodeRepository.findById(qrCodeId)
                .orElseThrow(() -> new NotFoundException("QR code not found with id: " + qrCodeId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));
        product.setQrCode(qrCode);
        productRepository.save(product);
        // qrCode.setProduct(product)
        return qrCodeMapper.qrCodeToQrCodeDTO(qrCode);
    }

    public QrCodeDTO assignQrCodeToWarehousePackage(Long qrCodeId, Long packageId) {
        QrCode qrCode = qrCodeRepository.findById(qrCodeId)
                .orElseThrow(() -> new NotFoundException("QR code not found with id: " + qrCodeId));
        WarehousePackage warehousePackage = warehousePackageRepository.findById(packageId)
                .orElseThrow(() -> new NotFoundException("Warehouse package not found with id: " + packageId));
        warehousePackage.setQrCode(qrCode);
        warehousePackageRepository.save(warehousePackage);
        return qrCodeMapper.qrCodeToQrCodeDTO(qrCode);
    }

    /**
     * gets a QR code by code string
     */
    public QrCodeDTO getQrCodeByCode(String code) {
        QrCode qrCode = qrCodeRepository.findByCode(code);
        if (qrCode == null) {
            throw new NotFoundException("QR code not found with code: " + code);
        }
        return qrCodeMapper.qrCodeToQrCodeDTO(qrCode);
    }

    public QrCodeDTO getQrCodeByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));
        if (product.getQrCode() == null) {
            throw new NotFoundException("QR code not assigned to product with id: " + productId);
        }
        return qrCodeMapper.qrCodeToQrCodeDTO(product.getQrCode());
    }

    public QrCodeDTO getQrCodeByPackageId(Long packageId) {
        WarehousePackage pkg = warehousePackageRepository.findById(packageId)
                .orElseThrow(() -> new NotFoundException("Warehouse package not found with id: " + packageId));
        if (pkg.getQrCode() == null) {
            throw new NotFoundException("QR code not assigned to package with id: " + packageId);
        }
        return qrCodeMapper.qrCodeToQrCodeDTO(pkg.getQrCode());
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
                .orElseThrow(() -> new NotFoundException("QR code not found with id: " + id));
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
        }).orElseThrow(() -> new NotFoundException("QR code not found with id: " + id));
    }

    /**
     * deletes a QR code by id
     */
    public void deleteQrCode(Long id) {
        if (!qrCodeRepository.existsById(id)) {
            throw new NotFoundException("QR code not found with id: " + id);
        }
        qrCodeRepository.deleteById(id);
    }

    // assign QR code to an entity (product, package, etc.)
    // add business methods like:
    // assignQrCodeToProduct(Long qrCodeId, Long productId)
    // assignQrCodeToWarehousePackage(Long qrCodeId, Long packageId)

    
}
