package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.WarehousePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehousePackageRepository extends JpaRepository<WarehousePackage, Long> {
    List<WarehousePackage> findByShipmentId(Long shipmentId);

    WarehousePackage findByBarcode_Code(String code);

    WarehousePackage findByQrCode_Code(String code);

}
