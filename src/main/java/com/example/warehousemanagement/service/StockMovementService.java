package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.StockMovementDTO;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.entity.StockMovement;
import com.example.warehousemanagement.entity.Warehouse;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.StockMovementMapper;
import com.example.warehousemanagement.entity.enums.MovementType;
import com.example.warehousemanagement.repository.ProductRepository;
import com.example.warehousemanagement.repository.StockMovementRepository;
import com.example.warehousemanagement.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final StockMovementMapper stockMovementMapper;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Autowired
    public StockMovementService(
            StockMovementRepository stockMovementRepository,
            StockMovementMapper stockMovementMapper,
            WarehouseRepository warehouseRepository,
            ProductRepository productRepository,
            InventoryService inventoryService) {
        this.stockMovementRepository = stockMovementRepository;
        this.stockMovementMapper = stockMovementMapper;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public StockMovementDTO createStockMovement(StockMovementDTO dto) {
        // Convert DTO to entity using MapStruct
        StockMovement stockMovement = stockMovementMapper.stockMovementDTOToStockMovement(dto);

        // Set associated Product
        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found with id: " + dto.getProductId()));
            stockMovement.setProduct(product);
        } else {
            throw new RuntimeException("Product id is required for stock movement");
        }

        // Set associated Warehouse
        if (dto.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                    .orElseThrow(() -> new NotFoundException("Warehouse not found with id: " + dto.getWarehouseId()));
            stockMovement.setWarehouse(warehouse);
        } else {
            throw new RuntimeException("Warehouse id is required for stock movement");
        }

        // Save the stock movement record
        StockMovement saved = stockMovementRepository.save(stockMovement);
        inventoryService.applyPhysicalQuantityDeltaForStockMovement(
                dto.getProductId(), dto.getWarehouseId(), dto.getQuantityChange());
        return stockMovementMapper.stockMovementToStockMovementDTO(saved);
    }

    public StockMovementDTO getStockMovementById(Long id) {
        return stockMovementRepository.findById(id)
                .map(stockMovementMapper::stockMovementToStockMovementDTO)
                .orElseThrow(() -> new NotFoundException("Stock movement not found with id: " + id));
    }

    /**
     * Paginated list with optional filters; newest first.
     */
    @Transactional(readOnly = true)
    public Page<StockMovementDTO> getStockMovements(
            Pageable pageable,
            Long warehouseId,
            Long productId,
            MovementType movementType,
            LocalDateTime dateFrom,
            LocalDateTime dateTo) {
        return stockMovementRepository
                .search(warehouseId, productId, movementType, dateFrom, dateTo, pageable)
                .map(stockMovementMapper::stockMovementToStockMovementDTO);
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
                        .orElseThrow(() -> new NotFoundException("Warehouse not found with id: " + dto.getWarehouseId()));
                existing.setWarehouse(warehouse);
            }

//            update associated product if productId is provided
            if(dto.getProductId() != null) {
                Product product = productRepository.findById(dto.getProductId())
                        .orElseThrow(() -> new NotFoundException("Product not found with id: " + dto.getProductId()));
                existing.setProduct(product);
            }

            StockMovement updated = stockMovementRepository.save(existing);
            return stockMovementMapper.stockMovementToStockMovementDTO(updated);
        }).orElseThrow(() -> new NotFoundException("Stock movement not found with id: " + id));
    }

    public void deleteStockMovement(Long id) {
        if (!stockMovementRepository.existsById(id)) {
            throw new NotFoundException("Stock movement not found with id: " + id);
        }
        stockMovementRepository.deleteById(id);
    }

}
