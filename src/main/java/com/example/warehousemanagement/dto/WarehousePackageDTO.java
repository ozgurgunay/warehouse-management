package com.example.warehousemanagement.dto;

import com.example.warehousemanagement.entity.enums.PackageType;
import lombok.Data;

import java.util.List;

@Data
public class WarehousePackageDTO {

    private Long id;
    private Long shipmentId;              // Reference to Shipment
    private Long barcodeId;               // Reference to Barcode
    private Long qrCodeId;                // Reference to QrCode
    private Double weight;                // Package weight (kg)
    private PackageType packageType;           // PackageType as enum value
    private List<PackageItemDTO> items;   // List of package items (DTO)

}
