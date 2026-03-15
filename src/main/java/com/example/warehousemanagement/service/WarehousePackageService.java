package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.PackageItemDTO;
import com.example.warehousemanagement.dto.WarehousePackageDTO;
import com.example.warehousemanagement.entity.PackageItem;
import com.example.warehousemanagement.entity.WarehousePackage;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.PackageItemMapper;
import com.example.warehousemanagement.mapper.WarehousePackageMapper;
import com.example.warehousemanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WarehousePackageService {

    private final WarehousePackageRepository warehousePackageRepository;
    private final WarehousePackageMapper warehousePackageMapper;
    private final ShipmentRepository shipmentRepository;
    private final BarcodeRepository barcodeRepository;
    private final QrCodeRepository qrCodeRepository;
    private final PackageItemRepository packageItemRepository;
    private final ProductRepository productRepository;
    private final PackageItemMapper packageItemMapper;


    @Autowired
    public WarehousePackageService(
            WarehousePackageRepository warehousePackageRepository,
            WarehousePackageMapper warehousePackageMapper,
            ShipmentRepository shipmentRepository,
            BarcodeRepository barcodeRepository,
            QrCodeRepository qrCodeRepository,
            PackageItemRepository packageItemRepository,
            ProductRepository productRepository,
            PackageItemMapper packageItemMapper
    ) {
        this.warehousePackageRepository = warehousePackageRepository;
        this.warehousePackageMapper = warehousePackageMapper;
        this.shipmentRepository = shipmentRepository;
        this.barcodeRepository = barcodeRepository;
        this.qrCodeRepository = qrCodeRepository;
        this.packageItemRepository = packageItemRepository;
        this.productRepository = productRepository;
        this.packageItemMapper = packageItemMapper;
    }

    /**
     * creates a new warehouse package, links to shipment, barcode, and QR code if provided
     */
    public WarehousePackageDTO createWarehousePackage(WarehousePackageDTO dto) {
        WarehousePackage pkg = warehousePackageMapper.warehousePackageDTOToWarehousePackage(dto);
        if (dto.getShipmentId() != null)
            pkg.setShipment(shipmentRepository.findById(dto.getShipmentId())
                    .orElseThrow(() -> new NotFoundException("Shipment not found with id: " + dto.getShipmentId())));
        if (dto.getBarcodeId() != null)
            pkg.setBarcode(barcodeRepository.findById(dto.getBarcodeId())
                    .orElseThrow(() -> new NotFoundException("Barcode not found with id: " + dto.getBarcodeId())));
        if (dto.getQrCodeId() != null)
            pkg.setQrCode(qrCodeRepository.findById(dto.getQrCodeId())
                    .orElseThrow(() -> new NotFoundException("QR code not found with id: " + dto.getQrCodeId())));
        // Items are handled separately (see addItemToPackage)
        return warehousePackageMapper.warehousePackageToWarehousePackageDTO(warehousePackageRepository.save(pkg));
    }

    /**
     * adds an item (product) to a warehouse package
     */
    public PackageItemDTO addItemToPackage(Long packageId, PackageItemDTO itemDto) {
        WarehousePackage pkg = warehousePackageRepository.findById(packageId)
                .orElseThrow(() -> new NotFoundException("Warehouse package not found with id: " + packageId));
        PackageItem item = new PackageItem();
        item.setPkg(pkg);
        item.setProduct(productRepository.findById(itemDto.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + itemDto.getProductId())));
        item.setQuantity(itemDto.getQuantity());
        PackageItem saved = packageItemRepository.save(item);
        return packageItemMapper.packageItemToPackageItemDTO(saved);
    }

    /**
     * finds a package by barcode or QR code
     */
    public WarehousePackageDTO findByBarcode(String barcode) {
        WarehousePackage pkg = warehousePackageRepository.findByBarcode_Code(barcode);
        return pkg != null ? warehousePackageMapper.warehousePackageToWarehousePackageDTO(pkg) : null;
    }

    public WarehousePackageDTO findByQrCode(String qrCode) {
        WarehousePackage pkg = warehousePackageRepository.findByQrCode_Code(qrCode);
        return pkg != null ? warehousePackageMapper.warehousePackageToWarehousePackageDTO(pkg) : null;
    }

    /**
     * gets all items in a package
     */
    public List<PackageItemDTO> getItemsInPackage(Long packageId) {
        return packageItemRepository.findByPackageId(packageId)
                .stream()
                .map(packageItemMapper::packageItemToPackageItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * updates weight, type, and codes of a package
     */
    public WarehousePackageDTO updateWarehousePackage(Long id, WarehousePackageDTO dto) {
        return warehousePackageRepository.findById(id).map(pkg -> {
            pkg.setWeight(dto.getWeight());
            pkg.setPackageType(dto.getPackageType());
            // Update barcode/qr relationships if necessary
            if (dto.getBarcodeId() != null)
                pkg.setBarcode(barcodeRepository.findById(dto.getBarcodeId())
                        .orElseThrow(() -> new NotFoundException("Barcode not found with id: " + dto.getBarcodeId())));
            if (dto.getQrCodeId() != null)
                pkg.setQrCode(qrCodeRepository.findById(dto.getQrCodeId())
                        .orElseThrow(() -> new NotFoundException("QR code not found with id: " + dto.getQrCodeId())));
            return warehousePackageMapper.warehousePackageToWarehousePackageDTO(warehousePackageRepository.save(pkg));
        }).orElseThrow(() -> new NotFoundException("Warehouse package not found with id: " + id));
    }

    /**
     * deletes a warehouse package by id
     */
    public void deleteWarehousePackage(Long id) {
        if (!warehousePackageRepository.existsById(id)) {
            throw new NotFoundException("Warehouse package not found with id: " + id);
        }
        warehousePackageRepository.deleteById(id);
    }

    // get all items of a package
    public List<PackageItemDTO> getItemsByPackageId(Long packageId) {
        return packageItemRepository.findByPackageId(packageId)
                .stream()
                .map(packageItemMapper::packageItemToPackageItemDTO)
                .collect(Collectors.toList());
    }

    //get a package by ID
    public WarehousePackageDTO getPackageById(Long id) {
        return warehousePackageRepository.findById(id)
                .map(warehousePackageMapper::warehousePackageToWarehousePackageDTO)
                .orElseThrow(() -> new NotFoundException("Warehouse package not found with id: " + id));
    }

    //get all packages
    public List<WarehousePackageDTO> getAllPackages() {
        return warehousePackageRepository.findAll()
                .stream().map(warehousePackageMapper::warehousePackageToWarehousePackageDTO)
                .collect(Collectors.toList());
    }



}
