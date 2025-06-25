package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Entity
@Table(name = "storage_locations")
public class StorageLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Location name cannot be empty.")
    private String name; // example: "shelf A-1"

    private String building;
    private String floor;
    private String section;
}
