package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.DeliveryReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryReceiptRepository extends JpaRepository<DeliveryReceipt, Long> {

    DeliveryReceipt findByShipmentId(Long shipmentId);

}
