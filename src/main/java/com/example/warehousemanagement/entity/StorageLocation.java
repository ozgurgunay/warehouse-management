package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Physical bin / slot inside a single warehouse. Location codes are unique per warehouse (WMS standard).
 */
@Data
@Entity
@Table(
        name = "storage_locations",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_storage_location_warehouse_code",
                columnNames = {"warehouse_id", "location_code"}
        )
)
public class StorageLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    /** Human-readable id (e.g. L-00042). Unique within {@link #warehouse}. Generated when omitted on create. */
    @Column(length = 48)
    private String locationCode;

    @NotBlank(message = "Location name cannot be empty.")
    private String name; // example: "shelf A-1"

    private String building;
    private String floor;
    private String section;

    /** Optional zone tag for fast-moving / hot area KPIs (e.g. Zone A). */
    @Column(length = 64)
    private String zoneLabel;
}
