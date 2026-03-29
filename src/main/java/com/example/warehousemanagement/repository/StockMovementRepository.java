package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.StockMovement;
import com.example.warehousemanagement.entity.enums.MovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProduct_IdOrderByMovementDateDesc(Long productId, Pageable pageable);

    /**
     * Optional filters use {@code COALESCE} instead of {@code (param IS NULL OR ...)} so PostgreSQL
     * always infers JDBC types for bound parameters (avoids "could not determine data type of parameter").
     */
    @Query(
            "SELECT sm FROM StockMovement sm WHERE "
                    + "sm.warehouse.id = COALESCE(:warehouseId, sm.warehouse.id) AND "
                    + "sm.product.id = COALESCE(:productId, sm.product.id) AND "
                    + "sm.movementType = COALESCE(:movementType, sm.movementType) AND "
                    + "sm.movementDate >= COALESCE(:dateFrom, sm.movementDate) AND "
                    + "sm.movementDate <= COALESCE(:dateTo, sm.movementDate)")
    Page<StockMovement> search(
            @Param("warehouseId") Long warehouseId,
            @Param("productId") Long productId,
            @Param("movementType") MovementType movementType,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable);
}
