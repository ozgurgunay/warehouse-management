package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.PackageItemDTO;
import com.example.warehousemanagement.entity.PackageItem;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.PackageItemMapper;
import com.example.warehousemanagement.repository.PackageItemRepository;
import com.example.warehousemanagement.repository.ProductRepository;
import com.example.warehousemanagement.repository.WarehousePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PackageItemService {

    /**
     * add a new product (item) to a package, update it, delete it

     * In addition to CRUD; advanced functions such as bulk transfer, product change, inventory synchronization can be easily added.

     * also add special search functions with fields such as “batchNo”, “barcode”, “qrCode”
     */


    private final PackageItemRepository packageItemRepository;
    private final PackageItemMapper packageItemMapper;
    private final WarehousePackageRepository warehousePackageRepository;
    private final ProductRepository productRepository;

    @Autowired
    public PackageItemService(
            PackageItemRepository packageItemRepository,
            PackageItemMapper packageItemMapper,
            WarehousePackageRepository warehousePackageRepository,
            ProductRepository productRepository
    ) {
        this.packageItemRepository = packageItemRepository;
        this.packageItemMapper = packageItemMapper;
        this.warehousePackageRepository = warehousePackageRepository;
        this.productRepository = productRepository;
    }


    /* adds a product as an item into a specific package  */
    public PackageItemDTO addPackageItem(PackageItemDTO dto) {
        PackageItem item = packageItemMapper.packageItemDTOToPackageItem(dto);
        // Set related package
        item.setPkg(warehousePackageRepository.findById(dto.getPackageId())
                .orElseThrow(() -> new NotFoundException("Warehouse package not found with id: " + dto.getPackageId())));
        // Set related product
        item.setProduct(productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + dto.getProductId())));
        return packageItemMapper.packageItemToPackageItemDTO(packageItemRepository.save(item));
    }



    public PackageItemDTO updatePackageItem(Long id, PackageItemDTO dto) {
        return packageItemRepository.findById(id).map(existing -> {
            existing.setQuantity(dto.getQuantity());

            // allow changing the product reference
            if (dto.getProductId() != null) {
                existing.setProduct(productRepository.findById(dto.getProductId())
                        .orElseThrow(() -> new NotFoundException("Product not found with id: " + dto.getProductId())));
            }
            // If you want to allow moving item to another package:
            if (dto.getPackageId() != null) {
                existing.setPkg(warehousePackageRepository.findById(dto.getPackageId())
                        .orElseThrow(() -> new NotFoundException("Warehouse package not found with id: " + dto.getPackageId())));
            }
            return packageItemMapper.packageItemToPackageItemDTO(packageItemRepository.save(existing));
        }).orElseThrow(() -> new NotFoundException("Package item not found with id: " + id));
    }


    public void deletePackageItem(Long id) {
        if (!packageItemRepository.existsById(id)) {
            throw new NotFoundException("Package item not found with id: " + id);
        }
        packageItemRepository.deleteById(id);
    }


    public List<PackageItemDTO> getPackageItemsByPackage(Long packageId) {
        return packageItemRepository.findByPackageId(packageId)
                .stream()
                .map(packageItemMapper::packageItemToPackageItemDTO)
                .collect(Collectors.toList());
    }


    public PackageItemDTO getPackageItem(Long id) {
        return packageItemRepository.findById(id)
                .map(packageItemMapper::packageItemToPackageItemDTO)
                .orElseThrow(() -> new NotFoundException("Package item not found with id: " + id));
    }



    public List<PackageItemDTO> getAllPackageItems() {
        return packageItemRepository.findAll()
                .stream()
                .map(packageItemMapper::packageItemToPackageItemDTO)
                .collect(Collectors.toList());
    }

    // extension points:
    // - Search for a package item by product barcode/QR
    // - Batch operations (remove all items from a package, transfer items between packages)
    // - Stock deduction/inventory sync after shipment is created


}
