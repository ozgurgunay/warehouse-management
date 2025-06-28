package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.Barcode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarcodeRepository extends JpaRepository<Barcode, Long> {
    Barcode findByCode(String code);
}
