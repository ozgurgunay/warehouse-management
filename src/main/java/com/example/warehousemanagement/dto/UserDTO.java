package com.example.warehousemanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    // Expose roles as a set of RoleDTO objects
    private Set<RoleDTO> roleDTOs;
    // indicates whether the user's email has been confirmed (enabled)
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
