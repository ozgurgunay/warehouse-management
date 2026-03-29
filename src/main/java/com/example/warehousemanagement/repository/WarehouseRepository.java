package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    boolean existsByWarehouseCodeIgnoreCase(String warehouseCode);

    boolean existsByWarehouseCodeIgnoreCaseAndIdNot(String warehouseCode, Long id);
}
