package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.PackageItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageItemRepository extends JpaRepository<PackageItem, Long> {
    //findByPackageId

    List<PackageItem> findByPackageId(Long packageId);
}
