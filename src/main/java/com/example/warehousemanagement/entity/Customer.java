package com.example.warehousemanagement.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String taxNumber;    // Optional, if B2B
    private String companyName;  // Optional

    // Audit fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
