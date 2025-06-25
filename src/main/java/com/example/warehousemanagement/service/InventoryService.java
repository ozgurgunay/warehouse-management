package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.InventoryDTO;
import com.example.warehousemanagement.entity.Inventory;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.entity.StorageLocation;
import com.example.warehousemanagement.entity.Warehouse;
import com.example.warehousemanagement.mapper.InventoryMapper;
import com.example.warehousemanagement.repository.InventoryRepository;
import com.example.warehousemanagement.repository.ProductRepository;
import com.example.warehousemanagement.repository.StorageLocationRepository;
import com.example.warehousemanagement.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StorageLocationRepository storageLocationRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryMapper inventoryMapper;

    @Autowired
    public InventoryService(InventoryRepository inventoryRepository, InventoryMapper inventoryMapper, StorageLocationRepository storageLocationRepository, ProductRepository productRepository, WarehouseRepository warehouseRepository) {
        this.inventoryRepository = inventoryRepository;
        this.storageLocationRepository = storageLocationRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryMapper = inventoryMapper;
    }

    public InventoryDTO createInventory(InventoryDTO dto) {

        Inventory inventory = inventoryMapper.inventoryDTOToInventory(dto);
        // Set associated Product
        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + dto.getProductId()));
            inventory.setProduct(product);
        } else {
            throw new RuntimeException("Product ID is required");
        }

        // Set associated Warehouse
        if (dto.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + dto.getWarehouseId()));
            inventory.setWarehouse(warehouse);
        } else {
            throw new RuntimeException("Warehouse ID is required");
        }

        // Set associated StorageLocation (optional)
        if (dto.getStorageLocationId() != null) {
            StorageLocation location = storageLocationRepository.findById(dto.getStorageLocationId())
                    .orElseThrow(() -> new RuntimeException("StorageLocation not found with id: " + dto.getStorageLocationId()));
            inventory.setStorageLocation(location);
        }

        Inventory saved = inventoryRepository.save(inventory);
        return inventoryMapper.inventoryToInventoryDTO(saved);
    }


    public InventoryDTO getInventoryById(Long id) {
        return inventoryRepository.findById(id)
                .map(inventoryMapper::inventoryToInventoryDTO)
                .orElse(null);
    }

    public List<InventoryDTO> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(inventoryMapper::inventoryToInventoryDTO)
                .collect(Collectors.toList());
    }

    public InventoryDTO updateInventory(Long id, InventoryDTO dto) {
        return inventoryRepository.findById(id).map(existing -> {
            existing.setQuantity(dto.getQuantity());
            existing.setBatchNumber(dto.getBatchNumber());
            existing.setExpiryDate(dto.getExpiryDate());

            // Update associated StorageLocation if storageLocationId is provided

            // update associated Product if productId is provided
            if (dto.getProductId() != null) {
                Product product = productRepository.findById(dto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + dto.getProductId()));
                existing.setProduct(product);
            }

            // update associated Warehouse if warehouseId is provided
            if (dto.getWarehouseId() != null) {
                Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                        .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + dto.getWarehouseId()));
                existing.setWarehouse(warehouse);
            }

            // update storageLocation
            if (dto.getStorageLocationId() != null) {
                StorageLocation location = storageLocationRepository.findById(dto.getStorageLocationId())
                        .orElseThrow(() -> new RuntimeException("StorageLocation not found with id: " + dto.getStorageLocationId()));
                existing.setStorageLocation(location);
            } else {
                // Optionally set to null if not provided
                existing.setStorageLocation(null);
            }


            Inventory updated = inventoryRepository.save(existing);
            return inventoryMapper.inventoryToInventoryDTO(updated);
        }).orElse(null);
    }

    public boolean deleteInventory(Long id) {
        if (inventoryRepository.existsById(id)) {
            inventoryRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
