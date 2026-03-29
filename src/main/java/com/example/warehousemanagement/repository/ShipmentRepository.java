package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    List<Shipment> findByOrder_Id(Long orderId);

    Shipment findByTrackingNumber(String trackingNumber);

    Shipment findByBarcode(String barcode);

    Shipment findByQrCode(String qrCode);

    /**
     * PostgreSQL: {@code lower(bytea)} is invalid; use {@code carrier::text}. Optional filters: JDBC binds NULL as
     * untyped {@code ?}; {@code (? IS NULL)} makes PostgreSQL error "could not determine data type of parameter".
     * Use {@code CAST(:name AS type) IS NULL} so the placeholder has a known type.
     */
    @Query(
            value = "SELECT * FROM shipments s WHERE "
                    + "(CAST(:status AS VARCHAR) IS NULL OR s.status = :status) AND "
                    + "(CAST(:orderId AS BIGINT) IS NULL OR s.order_id = :orderId) AND "
                    + "(CAST(:carrier AS VARCHAR) IS NULL OR LOWER(s.carrier::text) LIKE LOWER(CONCAT('%', :carrier, '%'))) AND "
                    + "(CAST(:tracking AS VARCHAR) IS NULL OR LOWER(s.tracking_number::text) LIKE LOWER(CONCAT('%', :tracking, '%'))) AND "
                    + "(CAST(:shippedFrom AS TIMESTAMP) IS NULL OR (s.shipped_date IS NOT NULL AND s.shipped_date >= :shippedFrom)) AND "
                    + "(CAST(:shippedTo AS TIMESTAMP) IS NULL OR (s.shipped_date IS NOT NULL AND s.shipped_date <= :shippedTo))",
            countQuery = "SELECT count(*) FROM shipments s WHERE "
                    + "(CAST(:status AS VARCHAR) IS NULL OR s.status = :status) AND "
                    + "(CAST(:orderId AS BIGINT) IS NULL OR s.order_id = :orderId) AND "
                    + "(CAST(:carrier AS VARCHAR) IS NULL OR LOWER(s.carrier::text) LIKE LOWER(CONCAT('%', :carrier, '%'))) AND "
                    + "(CAST(:tracking AS VARCHAR) IS NULL OR LOWER(s.tracking_number::text) LIKE LOWER(CONCAT('%', :tracking, '%'))) AND "
                    + "(CAST(:shippedFrom AS TIMESTAMP) IS NULL OR (s.shipped_date IS NOT NULL AND s.shipped_date >= :shippedFrom)) AND "
                    + "(CAST(:shippedTo AS TIMESTAMP) IS NULL OR (s.shipped_date IS NOT NULL AND s.shipped_date <= :shippedTo))",
            nativeQuery = true)
    Page<Shipment> search(
            @Param("status") String status,
            @Param("orderId") Long orderId,
            @Param("carrier") String carrier,
            @Param("tracking") String tracking,
            @Param("shippedFrom") LocalDateTime shippedFrom,
            @Param("shippedTo") LocalDateTime shippedTo,
            Pageable pageable);
}
