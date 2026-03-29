package com.example.warehousemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserEmergencyContactDTO {

    private Long id;

    @NotBlank
    @Size(max = 200)
    private String fullName;

    @Size(max = 80)
    private String relationship;

    @NotBlank
    @Size(max = 32)
    private String phonePrimary;

    @Size(max = 32)
    private String phoneSecondary;

    private int sortOrder;
}
