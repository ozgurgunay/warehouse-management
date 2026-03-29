package com.example.warehousemanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
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
    /** Username of the user who last updated this account (audit). */
    private String lastUpdatedByUsername;

    /** Present in detail responses; omitted from list endpoint for performance. */
    private UserProfileDTO profile;

    /** KVKK consent history; present in detail responses only. */
    private List<UserConsentDTO> consents;

}
