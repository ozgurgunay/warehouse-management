package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.QrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QrCodeRepository extends JpaRepository<QrCode, Long> {

    //search by qrCode string
    QrCode findByCode(String code);
}
