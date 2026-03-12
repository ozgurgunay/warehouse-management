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

    // MİMARİ DÜZELTME: i.status = 'AVAILABLE' yerine i.status = :status kullanıldı.
    // @Param anotasyonları eklenerek değişken eşleşmeleri garanti altına alındı.
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

    // MİMARİ ÇÖZÜM (Hatanın Sebebi): Spring'in kolon araması engellendi, özel sorgu yazıldı.
    // Kullanılabilir Stok = Toplam Fiziksel Stok (quantity) - Rezerve Edilmiş Stok (quantityAllocated)
    @Query("SELECT COALESCE(SUM(i.quantity - i.quantityAllocated), 0) FROM Inventory i " +
            "WHERE i.product.id = :productId " +
            "AND i.warehouse.id = :warehouseId " +
            "AND i.status = 'AVAILABLE'")
    Integer findAvailableStock(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId
    );

    // Spring Data JPA bu metodu isminden otomatik anlar (findBy...And...And...).
    // Bu yüzden üzerine @Query yazmaya gerek yoktur, hatasız çalışır.
    List<Inventory> findByProductIdAndWarehouseIdAndStatus(Long productId, Long warehouseId, InventoryStatus status);

    /**
     * Retrieves available inventory for a specific product, ordered by expiry date (Oldest first).
     * This is crucial for the FEFO (First Expiring, First Out) allocation strategy.
     */
    List<Inventory> findByProductIdAndStatusOrderByExpiryDateAsc(Long productId, InventoryStatus status);

}