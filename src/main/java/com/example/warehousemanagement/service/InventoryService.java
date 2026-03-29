package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.InventoryDTO;
import com.example.warehousemanagement.entity.Inventory;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.entity.StorageLocation;
import com.example.warehousemanagement.entity.Warehouse;
import com.example.warehousemanagement.entity.enums.InventoryStatus;
import com.example.warehousemanagement.exception.InsufficientStockException;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.InventoryMapper;
import com.example.warehousemanagement.repository.InventoryRepository;
import com.example.warehousemanagement.repository.ProductRepository;
import com.example.warehousemanagement.repository.StorageLocationRepository;
import com.example.warehousemanagement.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
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

    @Transactional
    public InventoryDTO createInventory(InventoryDTO dto) {

        Inventory inventory = inventoryMapper.inventoryDTOToInventory(dto);
        // Set associated Product
        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found with id: " + dto.getProductId()));
            inventory.setProduct(product);
        } else {
            throw new IllegalArgumentException("Product ID is required");
        }

        // Set associated Warehouse
        if (dto.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                    .orElseThrow(() -> new NotFoundException("Warehouse not found with id: " + dto.getWarehouseId()));
            inventory.setWarehouse(warehouse);
        } else {
            throw new IllegalArgumentException("Warehouse ID is required");
        }

        // Set associated StorageLocation (optional); must belong to the same warehouse
        if (dto.getStorageLocationId() != null) {
            StorageLocation location = storageLocationRepository.findById(dto.getStorageLocationId())
                    .orElseThrow(() -> new NotFoundException("StorageLocation not found with id: " + dto.getStorageLocationId()));
            assertStorageLocationBelongsToWarehouse(location, inventory.getWarehouse());
            inventory.setStorageLocation(location);
        }

        Inventory saved = inventoryRepository.save(inventory);
        return inventoryMapper.inventoryToInventoryDTO(saved);
    }


    public InventoryDTO getInventoryById(Long id) {
        return inventoryRepository.findById(id)
                .map(inventoryMapper::inventoryToInventoryDTO)
                .orElseThrow(() -> new NotFoundException("Inventory not found with id: " + id));
    }

    public List<InventoryDTO> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(inventoryMapper::inventoryToInventoryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns paginated inventories with optional filtering by product, warehouse and status.
     */
    @Transactional(readOnly = true)
    public List<InventoryDTO> getInventories(Long productId,
                                             Long warehouseId,
                                             InventoryStatus status,
                                             int page,
                                             int size) {
        Pageable pageable = PageRequest.of(page, size);

        // If we have an exact repository method that matches all filters, use it and then page manually.
        if (productId != null && warehouseId != null && status != null) {
            return inventoryRepository
                    .findByProductIdAndWarehouseIdAndStatus(productId, warehouseId, status).stream()
                    .skip((long) page * size)
                    .limit(size)
                    .map(inventoryMapper::inventoryToInventoryDTO)
                    .collect(Collectors.toList());
        }

        // Otherwise, fetch a page and apply remaining filters in memory.
        return inventoryRepository.findAll(pageable)
                .map(inv -> inv)
                .stream()
                .filter(inv -> productId == null || inv.getProduct().getId().equals(productId))
                .filter(inv -> warehouseId == null || inv.getWarehouse().getId().equals(warehouseId))
                .filter(inv -> status == null || inv.getStatus() == status)
                .map(inventoryMapper::inventoryToInventoryDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public InventoryDTO updateInventory(Long id, InventoryDTO dto) {
        return inventoryRepository.findById(id).map(existing -> {
            existing.setQuantity(dto.getQuantity());
            existing.setBatchNumber(dto.getBatchNumber());
            existing.setExpiryDate(dto.getExpiryDate());

            // Update associated StorageLocation if storageLocationId is provided

            // update associated Product if productId is provided
            if (dto.getProductId() != null) {
                Product product = productRepository.findById(dto.getProductId())
                        .orElseThrow(() -> new NotFoundException("Product not found with id: " + dto.getProductId()));
                existing.setProduct(product);
            }

            // update associated Warehouse if warehouseId is provided
            if (dto.getWarehouseId() != null) {
                Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                        .orElseThrow(() -> new NotFoundException("Warehouse not found with id: " + dto.getWarehouseId()));
                existing.setWarehouse(warehouse);
            }

            // update storageLocation (must match warehouse on the line after any warehouse change)
            if (dto.getStorageLocationId() != null) {
                StorageLocation location = storageLocationRepository.findById(dto.getStorageLocationId())
                        .orElseThrow(() -> new NotFoundException("StorageLocation not found with id: " + dto.getStorageLocationId()));
                assertStorageLocationBelongsToWarehouse(location, existing.getWarehouse());
                existing.setStorageLocation(location);
            } else {
                existing.setStorageLocation(null);
            }


            Inventory updated = inventoryRepository.save(existing);
            return inventoryMapper.inventoryToInventoryDTO(updated);
        }).orElseThrow(() -> new NotFoundException("Inventory not found with id: " + id));
    }

    public void deleteInventory(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new NotFoundException("Inventory not found with id: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    /**
     * Changes the status of a stock record (for example: AVAILABLE -> DAMAGED).
     * If the amount is partial (for example, 5 out of 100 become damaged), the existing record is split by creating or merging a target record.
     */
    @Transactional
    public void changeInventoryStatus(Long inventoryId, int amountToMove, InventoryStatus targetStatus) {
        // 1. Find source inventory
        Inventory sourceInventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new NotFoundException("Inventory not found with id: " + inventoryId));

        // 2. Validations
        validateStatusChange(sourceInventory, amountToMove, targetStatus);

        // 3. Decrease quantity from source
        sourceInventory.setQuantity(sourceInventory.getQuantity() - amountToMove);
        inventoryRepository.save(sourceInventory);

        // 4. Add stock to target status (refactored method)
        addStockToStatus(sourceInventory, amountToMove, targetStatus);
    }

    // --- Helper (extracted) methods ---

    /**
     * Adds stock to the target status.
     * If a record with the same attributes and target status already exists it will be merged,
     * otherwise a new inventory row will be created.
     */
    private void addStockToStatus(Inventory source, int amount, InventoryStatus status) {

        Long locationId = (source.getStorageLocation() != null) ? source.getStorageLocation().getId() : null;

        // Check if there is already a row in the database with the same attributes and target status.
        Optional<Inventory> existingInventory = inventoryRepository.findExistingInventory(
                source.getProduct().getId(),
                source.getWarehouse().getId(),
                locationId,
                source.getBatchNumber(),
                source.getExpiryDate(),
                status // Yeni statü
        );

        if (existingInventory.isPresent()) {
            // If found: increase quantity
            Inventory target = existingInventory.get();
            target.setQuantity(target.getQuantity() + amount);
            inventoryRepository.save(target);
        } else {
            // If not found: create a new row (clone logic)
            createTargetInventory(source, amount, status);
        }
    }

    // Method responsible only for creating and persisting the new inventory row
    private void createTargetInventory(Inventory source, int amount, InventoryStatus status) {
        Inventory target = new Inventory();
        target.setProduct(source.getProduct());
        target.setWarehouse(source.getWarehouse());
        target.setStorageLocation(source.getStorageLocation());
        target.setBatchNumber(source.getBatchNumber());
        target.setExpiryDate(source.getExpiryDate());

        target.setQuantity(amount);
        target.setStatus(status);

        inventoryRepository.save(target);
    }

    private static void assertStorageLocationBelongsToWarehouse(StorageLocation location, Warehouse warehouse) {
        if (location.getWarehouse() == null || warehouse == null) {
            throw new IllegalStateException("Storage location and warehouse must be loaded for validation.");
        }
        if (!location.getWarehouse().getId().equals(warehouse.getId())) {
            throw new IllegalArgumentException(
                    "Storage location must belong to the same warehouse as the inventory line.");
        }
    }

    private void validateStatusChange(Inventory source, int amount, InventoryStatus targetStatus) {
        if (source.getStatus() == targetStatus) {
            throw new IllegalArgumentException("Target status cannot be the same as current status.");
        }
        int allocated = source.getQuantityAllocated() != null ? source.getQuantityAllocated() : 0;
        int availableForStatusChange = source.getQuantity() - allocated;
        if (availableForStatusChange < amount) {
            throw new InsufficientStockException("Not enough unallocated stock to change status. " +
                    "Available for status change: " + availableForStatusChange + ", requested: " + amount);
        }
    }

    // Checks if there is enough sellable stock for the given product and warehouse.
    public boolean checkStockAvailability(Long productId, Long warehouseId, int requestedAmount) {
        Integer availableStock = inventoryRepository.findAvailableStock(
                productId,
                warehouseId,
                InventoryStatus.AVAILABLE
        );
        return availableStock >= requestedAmount;
    }

    /**
     * Applies a signed change to physical quantity on an AVAILABLE line for the product/warehouse.
     * Prefers a row with no storage location (aggregate "unlocated" stock); otherwise the lowest id.
     * Creates a new unlocated line when there is no row and {@code deltaQuantity} is positive.
     * <p>
     * Intended to run in the same transaction as creating a {@code StockMovement} audit row.
     */
    @Transactional
    public void applyPhysicalQuantityDeltaForStockMovement(Long productId, Long warehouseId, int deltaQuantity) {
        if (deltaQuantity == 0) {
            return;
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse not found with id: " + warehouseId));

        List<Inventory> rows = inventoryRepository.findByProductIdAndWarehouseIdAndStatus(
                productId, warehouseId, InventoryStatus.AVAILABLE);

        if (rows.isEmpty()) {
            if (deltaQuantity < 0) {
                throw new InsufficientStockException("No inventory to reduce for this product and warehouse.");
            }
            Inventory created = new Inventory();
            created.setProduct(product);
            created.setWarehouse(warehouse);
            created.setQuantity(deltaQuantity);
            created.setQuantityAllocated(0);
            created.setStatus(InventoryStatus.AVAILABLE);
            inventoryRepository.save(created);
            return;
        }

        Inventory target = rows.stream()
                .filter(i -> i.getStorageLocation() == null)
                .min(Comparator.comparing(Inventory::getId))
                .orElseGet(() -> rows.stream()
                        .min(Comparator.comparing(Inventory::getId))
                        .orElseThrow());

        int allocated = target.getQuantityAllocated() != null ? target.getQuantityAllocated() : 0;
        int newQty = target.getQuantity() + deltaQuantity;
        if (newQty < 0) {
            throw new InsufficientStockException("Not enough physical stock for this warehouse.");
        }
        if (newQty < allocated) {
            throw new InsufficientStockException(
                    "Physical quantity would drop below reserved quantity; release allocations first.");
        }
        target.setQuantity(newQty);
        inventoryRepository.save(target);
    }

}
