package com.example.warehousemanagement.service;

import com.example.warehousemanagement.entity.Inventory;
import com.example.warehousemanagement.entity.InventoryAllocation;
import com.example.warehousemanagement.entity.Order;
import com.example.warehousemanagement.entity.enums.InventoryStatus;
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
     * Gelen bir sipariş için stok rezerve eder.
     * FEFO (First Expiring First Out) kuralına göre SKT'si en yakın olan ürünleri önceliklendirir.
     */
    @Transactional
    public void allocateStockForOrder(Long orderId, Long productId, int requestedQuantity) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı: " + orderId));

        // 1. Ürünün depodaki KULLANILABİLİR ve statüsü AVAILABLE olan kayıtlarını SKT'ye göre sıralı getir
        List<Inventory> availableInventories = inventoryRepository
                .findByProductIdAndStatusOrderByExpiryDateAsc(productId, InventoryStatus.AVAILABLE);

        int remainingQuantityToAllocate = requestedQuantity;

        for (Inventory inventory : availableInventories) {
            if (remainingQuantityToAllocate <= 0) break; // İhtiyacımız olanı ayırdık, döngüden çık

            // Bu satırdaki KULLANILABİLİR (Satılabilir) miktar nedir?
            int availableInThisRow = inventory.getAvailableQuantity();

            if (availableInThisRow > 0) {
                // Bu satırdan ne kadar alabiliriz? (İhtiyacımız olan ile bu satırda olanın minimumu)
                int quantityToTake = Math.min(availableInThisRow, remainingQuantityToAllocate);

                // 2. Allocation (Rezervasyon) kaydını oluştur
                InventoryAllocation allocation = new InventoryAllocation();
                allocation.setInventory(inventory);
                allocation.setOrder(order);
                allocation.setAllocatedQuantity(quantityToTake);
                allocation.setExpirationTime(LocalDateTime.now().plusHours(24)); // Örn: 24 saat içinde ödenmezse düşer
                allocationRepository.save(allocation);

                // 3. Inventory tablosundaki "Ayrılmış Miktar" kolonunu güncelle
                inventory.setQuantityAllocated(inventory.getQuantityAllocated() + quantityToTake);
                inventoryRepository.save(inventory);

                // Kalan ihtiyacı düş
                remainingQuantityToAllocate -= quantityToTake;
            }
        }

        // 4. Döngü bitti ama hala rezerve edemediğimiz miktar varsa, depoda yeterli stok yok demektir!
        if (remainingQuantityToAllocate > 0) {
            throw new RuntimeException("Yetersiz stok! Order no: " + orderId +
                    " Eksik miktar: " + remainingQuantityToAllocate);
        }
    }
}