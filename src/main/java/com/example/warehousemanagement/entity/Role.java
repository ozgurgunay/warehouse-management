package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Role name cannot be blank")
    @Column(unique = true, nullable = false)
    private String name;

    // Optionally, you can add a description for the role.
    private String description;



}
