package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.Inventory;
import com.example.warehousemanagement.entity.enums.InventoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Architectural note: Status is compared via parameter binding instead of hard coded string.
    // @Param annotations guarantee parameter-name binding.
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId " +
            "AND i.warehouse.id = :warehouseId " +
            "AND (:locationId IS NULL OR i.storageLocation.id = :locationId) " +
            "AND i.batchNumber = :batchNumber " +
            "AND i.expiryDate = :expiryDate " +
            "AND i.status = :status")
    Optional<Inventory> findExistingInventory(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId,
            @Param("locationId") Long locationId,
            @Param("batchNumber") String batchNumber,
            @Param("expiryDate") LocalDate expiryDate,
            @Param("status") InventoryStatus status
    );

    // Architectural note: Available stock is calculated explicitly to avoid column name ambiguity.
    // Available stock = Physical stock (quantity) - Reserved stock (quantityAllocated)
    @Query("SELECT COALESCE(SUM(i.quantity - COALESCE(i.quantityAllocated, 0)), 0) FROM Inventory i " +
            "WHERE i.product.id = :productId " +
            "AND i.warehouse.id = :warehouseId " +
            "AND i.status = :status")
    Integer findAvailableStock(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId,
            @Param("status") InventoryStatus status
    );

    // Spring Data JPA understands this method from its name (findBy...And...And...),
    // so there is no need for a custom @Query definition here.
    List<Inventory> findByProductIdAndWarehouseIdAndStatus(Long productId, Long warehouseId, InventoryStatus status);

    /**
     * Retrieves available inventory for a specific product, ordered by expiry date (Oldest first).
     * This is crucial for the FEFO (First Expiring, First Out) allocation strategy.
     */
    List<Inventory> findByProductIdAndStatusOrderByExpiryDateAsc(Long productId, InventoryStatus status);

}