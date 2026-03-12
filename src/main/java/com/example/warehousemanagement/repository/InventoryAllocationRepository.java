package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.InventoryAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
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
     * Finds all allocations associated with a specific inventory row.
     */
    List<InventoryAllocation> findByInventoryId(Long inventoryId);

    /**
     * Finds allocations that have expired (e.g., payment timeout).
     * Useful for a scheduled Cron Job to release unpaid reserved stock.
     */
    List<InventoryAllocation> findByExpirationTimeBefore(LocalDateTime currentTime);


}
