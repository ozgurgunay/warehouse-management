package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.StorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StorageLocationRepository extends JpaRepository<StorageLocation, Long> {

    List<StorageLocation> findByWarehouse_IdOrderByIdAsc(Long warehouseId);

    long countByWarehouse_Id(Long warehouseId);

    boolean existsByWarehouse_IdAndLocationCodeIgnoreCase(Long warehouseId, String locationCode);

    boolean existsByWarehouse_IdAndLocationCodeIgnoreCaseAndIdNot(Long warehouseId, String locationCode, Long id);
}
