package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    List<Shipment> findByOrderId(Long orderId);
    Shipment findByTrackingNumber(String trackingNumber);

}
