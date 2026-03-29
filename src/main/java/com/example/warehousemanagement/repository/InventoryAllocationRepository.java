package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.InventoryAllocation;
import com.example.warehousemanagement.entity.enums.AllocationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryAllocationRepository extends JpaRepository<InventoryAllocation, Long> {

    /**
     * Finds all allocations (reservations) made for a specific order.
     * Useful when an order is shipped (to reduce physical stock) or cancelled (to release stock).
     */
    List<InventoryAllocation> findByOrderId(Long orderId);

    /**
     * Finds ACTIVE allocations for a specific order.
     * This is used when consuming or releasing reservations.
     */
    List<InventoryAllocation> findByOrderIdAndStatus(Long orderId, AllocationStatus status);

    /**
     * Finds all allocations associated with a specific inventory row.
     */
    List<InventoryAllocation> findByInventoryId(Long inventoryId);

    /**
     * Finds allocations that have expired (e.g., payment timeout).
     * Useful for a scheduled Cron Job to release unpaid reserved stock.
     */
    List<InventoryAllocation> findByExpirationTimeBefore(LocalDateTime currentTime);

    /**
     * Paginated search with optional filters. Uses COALESCE so PostgreSQL infers JDBC types for nullable params.
     */
    @Query(
            "SELECT ia FROM InventoryAllocation ia WHERE "
                    + "ia.inventory.warehouse.id = COALESCE(:warehouseId, ia.inventory.warehouse.id) AND "
                    + "ia.inventory.product.id = COALESCE(:productId, ia.inventory.product.id) AND "
                    + "ia.order.id = COALESCE(:orderId, ia.order.id) AND "
                    + "ia.status = COALESCE(:status, ia.status) AND "
                    + "ia.createdAt >= COALESCE(:dateFrom, ia.createdAt) AND "
                    + "ia.createdAt <= COALESCE(:dateTo, ia.createdAt)")
    Page<InventoryAllocation> search(
            @Param("warehouseId") Long warehouseId,
            @Param("productId") Long productId,
            @Param("orderId") Long orderId,
            @Param("status") AllocationStatus status,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable);

}
