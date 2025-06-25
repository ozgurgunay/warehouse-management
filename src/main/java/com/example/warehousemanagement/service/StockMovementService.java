package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.StockMovementDTO;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.entity.StockMovement;
import com.example.warehousemanagement.entity.Warehouse;
import com.example.warehousemanagement.mapper.StockMovementMapper;
import com.example.warehousemanagement.repository.ProductRepository;
import com.example.warehousemanagement.repository.StockMovementRepository;
import com.example.warehousemanagement.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final StockMovementMapper stockMovementMapper;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    @Autowired
    public StockMovementService(StockMovementRepository stockMovementRepository, StockMovementMapper stockMovementMapper, WarehouseRepository warehouseRepository, ProductRepository productRepository) {
        this.stockMovementRepository = stockMovementRepository;
        this.stockMovementMapper = stockMovementMapper;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }

    public StockMovementDTO createStockMovement(StockMovementDTO dto) {
        // Convert DTO to entity using MapStruct
        StockMovement stockMovement = stockMovementMapper.stockMovementDTOToStockMovement(dto);

        // Set associated Product
        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + dto.getProductId()));
            stockMovement.setProduct(product);
        } else {
            throw new RuntimeException("Product id is required for stock movement");
        }

        // Set associated Warehouse
        if (dto.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + dto.getWarehouseId()));
            stockMovement.setWarehouse(warehouse);
        } else {
            throw new RuntimeException("Warehouse id is required for stock movement");
        }

        // Save the stock movement record
        StockMovement saved = stockMovementRepository.save(stockMovement);
        return stockMovementMapper.stockMovementToStockMovementDTO(saved);
    }

    public StockMovementDTO getStockMovementById(Long id) {
        return stockMovementRepository.findById(id)
                .map(stockMovementMapper::stockMovementToStockMovementDTO)
                .orElse(null);
    }

    public List<StockMovementDTO> getAllStockMovements() {
        return stockMovementRepository.findAll().stream()
                .map(stockMovementMapper::stockMovementToStockMovementDTO)
                .collect(Collectors.toList());
    }

    public StockMovementDTO updateStockMovement(Long id, StockMovementDTO dto) {
        return stockMovementRepository.findById(id).map(existing -> {
            existing.setMovementType(dto.getMovementType());
            existing.setReason(dto.getReason());
            existing.setQuantityChange(dto.getQuantityChange());
            // For associated entities, update if needed.
            existing.setCreatedBy(dto.getCreatedBy());
            existing.setUpdatedBy(dto.getUpdatedBy());

//          update associated warehouse if warehouseId is provided
            if(dto.getWarehouseId() != null) {
                Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                        .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + dto.getWarehouseId()));
                existing.setWarehouse(warehouse);
            }

//            update associated product if productId is provided
            if(dto.getProductId() != null) {
                Product product = productRepository.findById(dto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + dto.getProductId()));
                existing.setProduct(product);
            }

            StockMovement updated = stockMovementRepository.save(existing);
            return stockMovementMapper.stockMovementToStockMovementDTO(updated);
        }).orElse(null);
    }

    public boolean deleteStockMovement(Long id) {
        if (stockMovementRepository.existsById(id)) {
            stockMovementRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
