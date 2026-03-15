package com.example.warehousemanagement.service;

import com.example.warehousemanagement.entity.Inventory;
import com.example.warehousemanagement.entity.InventoryAllocation;
import com.example.warehousemanagement.entity.Order;
import com.example.warehousemanagement.entity.enums.AllocationStatus;
import com.example.warehousemanagement.entity.enums.InventoryStatus;
import com.example.warehousemanagement.exception.InsufficientStockException;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.repository.InventoryAllocationRepository;
import com.example.warehousemanagement.repository.InventoryRepository;
import com.example.warehousemanagement.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryAllocationService {

    private final InventoryRepository inventoryRepository;
    private final InventoryAllocationRepository allocationRepository;
    private final OrderRepository orderRepository;

    /**
     * Allocates (reserves) stock for a given order.
     * Uses FEFO (First Expiring First Out) strategy by prioritizing items with the earliest expiry date.
     */
    @Transactional
    public void allocateStockForOrder(Long orderId, Long productId, int requestedQuantity) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));

        // 1. Fetch AVAILABLE inventory rows for this product, ordered by expiry date (FEFO).
        List<Inventory> availableInventories = inventoryRepository
                .findByProductIdAndStatusOrderByExpiryDateAsc(productId, InventoryStatus.AVAILABLE);

        int remainingQuantityToAllocate = requestedQuantity;

        for (Inventory inventory : availableInventories) {
            if (remainingQuantityToAllocate <= 0) break; // Already allocated required quantity, exit loop.

            // How much SELLABLE quantity is available on this row?
            int availableInThisRow = inventory.getAvailableQuantity();

            if (availableInThisRow > 0) {
                // Take the minimum of what we need and what this row can provide.
                int quantityToTake = Math.min(availableInThisRow, remainingQuantityToAllocate);

                // 2. Create allocation (reservation) record
                InventoryAllocation allocation = new InventoryAllocation();
                allocation.setInventory(inventory);
                allocation.setOrder(order);
                allocation.setAllocatedQuantity(quantityToTake);
                allocation.setExpirationTime(LocalDateTime.now().plusHours(24)); // Example: expires in 24 hours if not used.
                allocationRepository.save(allocation);

                // 3. Update "allocated quantity" on the inventory row
                inventory.setQuantityAllocated(inventory.getQuantityAllocated() + quantityToTake);
                inventoryRepository.save(inventory);

                // Decrease remaining required quantity
                remainingQuantityToAllocate -= quantityToTake;
            }
        }

        // 4. If there is still remaining quantity, there was not enough stock in the warehouse.
        if (remainingQuantityToAllocate > 0) {
            throw new InsufficientStockException(
                    "Insufficient stock for order " + orderId + ". Missing quantity: " + remainingQuantityToAllocate
            );
        }
    }

    /**
     * Consumes ACTIVE allocations for the given order:
     *  - decreases physical quantity on related inventory rows
     *  - decreases quantityAllocated
     *  - marks allocations as USED
     * This should be called when an order/shipment is finalized (e.g. delivered or shipped).
     */
    @Transactional
    public void consumeAllocationsForOrder(Long orderId) {
        List<InventoryAllocation> allocations =
                allocationRepository.findByOrderIdAndStatus(orderId, AllocationStatus.ACTIVE);

        if (allocations.isEmpty()) {
            return;
        }

        for (InventoryAllocation allocation : allocations) {
            Inventory inventory = allocation.getInventory();
            int qty = allocation.getAllocatedQuantity();

            int newQuantity = inventory.getQuantity() - qty;
            if (newQuantity < 0) {
                throw new InsufficientStockException(
                        "Cannot consume allocation. Inventory quantity would become negative for inventory id: "
                                + inventory.getId());
            }
            inventory.setQuantity(newQuantity);

            int currentAllocated = inventory.getQuantityAllocated() != null ? inventory.getQuantityAllocated() : 0;
            inventory.setQuantityAllocated(currentAllocated - qty);

            allocation.setStatus(AllocationStatus.USED);

            inventoryRepository.save(inventory);
            allocationRepository.save(allocation);
        }
    }

    /**
     * Releases ACTIVE allocations for the given order:
     *  - decreases quantityAllocated on related inventory rows
     *  - keeps physical quantity unchanged
     *  - marks allocations as RELEASED (or EXPIRED) depending on flag
     * This should be called when an order is cancelled or times out.
     */
    @Transactional
    public void releaseAllocationsForOrder(Long orderId, boolean expired) {
        List<InventoryAllocation> allocations =
                allocationRepository.findByOrderIdAndStatus(orderId, AllocationStatus.ACTIVE);

        if (allocations.isEmpty()) {
            return;
        }

        AllocationStatus targetStatus = expired ? AllocationStatus.EXPIRED : AllocationStatus.RELEASED;

        for (InventoryAllocation allocation : allocations) {
            Inventory inventory = allocation.getInventory();
            int qty = allocation.getAllocatedQuantity();

            int currentAllocated = inventory.getQuantityAllocated() != null ? inventory.getQuantityAllocated() : 0;
            inventory.setQuantityAllocated(currentAllocated - qty);

            allocation.setStatus(targetStatus);

            inventoryRepository.save(inventory);
            allocationRepository.save(allocation);
        }
    }
}