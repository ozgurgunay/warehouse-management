package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * Equipment / safety certifications (e.g. forklift). Linked to profile for HR and compliance tracking.
 */
@Data
@Entity
@Table(
        name = "user_certifications",
        indexes = @Index(name = "idx_user_cert_profile_id", columnList = "user_profile_id")
)
public class UserCertification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile profile;

    @NotBlank
    @Size(max = 120)
    private String certificationType;

    @Size(max = 120)
    private String certificateNumber;

    private LocalDate issuedAt;

    private LocalDate expiresAt;

    @Size(max = 200)
    private String issuerName;
}
