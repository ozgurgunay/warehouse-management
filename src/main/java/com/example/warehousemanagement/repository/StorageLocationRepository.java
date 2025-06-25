package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.StorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StorageLocationRepository extends JpaRepository<StorageLocation, Long> {
}
