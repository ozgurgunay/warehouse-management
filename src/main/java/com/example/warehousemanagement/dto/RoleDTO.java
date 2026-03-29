package com.example.warehousemanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoleDTO {

    private Long id;
    private String name;
    private String description;
    private boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    /** Username of the user who last updated this role (audit). */
    private String lastUpdatedByUsername;
}
