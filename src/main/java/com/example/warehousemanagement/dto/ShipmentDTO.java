package com.example.warehousemanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ShipmentDTO {

    private Long id;
    private Long orderId;                        // reference to Order
    private String status;                       // shipmentStatus as String
    private String carrier;                      // e.g., "DHL", "UPS"
    private String trackingNumber;               // provided by carrier
    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;
    private String shippingAddress;
    private List<WarehousePackageDTO> packages;           // list of associated packages (DTO)
    private DeliveryReceiptDTO deliveryReceipt;  // associated delivery receipt (DTO)
    private LocalDateTime estimatedArrivalDate;
    private Double shipmentCost;
    private String shippingMethod;               // shippingMethod as String
    private String shippingMethodDescription;
    private String barcode;                      // classic barcode string
    private String qrCode;                       // QR code string

}
