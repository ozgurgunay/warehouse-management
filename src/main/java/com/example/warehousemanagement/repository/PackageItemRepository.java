package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.PackageItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageItemRepository extends JpaRepository<PackageItem, Long> {

    @Query("SELECT pi FROM PackageItem pi WHERE pi.pkg.id = :packageId")
    List<PackageItem> findByPackageId(@Param("packageId") Long packageId);

}