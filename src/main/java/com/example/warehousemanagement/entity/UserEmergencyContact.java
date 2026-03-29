package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Emergency contact rows for a {@link UserProfile}. Kept separate for normalization and retention policies.
 */
@Data
@Entity
@Table(
        name = "user_emergency_contacts",
        indexes = @Index(name = "idx_user_emergency_profile_id", columnList = "user_profile_id")
)
public class UserEmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile profile;

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

    @Column(nullable = false)
    private int sortOrder;
}
