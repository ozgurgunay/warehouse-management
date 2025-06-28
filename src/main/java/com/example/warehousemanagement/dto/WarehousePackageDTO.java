package com.example.warehousemanagement.dto;

import lombok.Data;

import java.util.List;

@Data
public class WarehousePackageDTO {

    private Long id;
    private Long shipmentId;              // Reference to Shipment
    private Long barcodeId;               // Reference to Barcode
    private Long qrCodeId;                // Reference to QrCode
    private Double weight;                // Package weight (kg)
    private String packageType;           // PackageType as String (enum value)
    private List<PackageItemDTO> items;   // List of package items (DTO)

}
