package com.example.warehousemanagement.entity;

import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.entity.enums.ShippingMethod;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "shipments")
@Data
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    private String carrier;            // e.g. "DHL", "UPS"
    private String trackingNumber;     // Provided by carrier

    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;

    private String shippingAddress;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WarehousePackage> warehousePackages;

    @OneToOne(mappedBy = "shipment", cascade = CascadeType.ALL)
    private DeliveryReceipt deliveryReceipt;

    private LocalDateTime estimatedArrivalDate;
    private Double shipmentCost;
    @Enumerated(EnumType.STRING)
    private ShippingMethod shippingMethod;  // Delivery method for this shipment

    private String shippingMethodDescription;

    @Column(unique = true)
    private String barcode;   // Classic barcode string
    @Column(unique = true)
    private String qrCode;    // QR code data string (may match barcode or be separate)


}
