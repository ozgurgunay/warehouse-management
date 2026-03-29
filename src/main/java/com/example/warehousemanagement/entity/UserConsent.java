package com.example.warehousemanagement.entity;

import com.example.warehousemanagement.entity.enums.ConsentType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Immutable-style consent log: what was accepted, which policy version, and when.
 * KVKK: demonstrate explicit consent and allow withdrawal tracking for optional purposes.
 */
@Data
@Entity
@Table(
        name = "user_consents",
        indexes = {
                @Index(name = "idx_user_consents_user_id", columnList = "user_id"),
                @Index(name = "idx_user_consents_user_type", columnList = "user_id, consent_type")
        }
)
public class UserConsent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private ConsentType consentType;

    /**
     * Version of the legal text shown to the user (e.g. "privacy-v2025-03-01").
     */
    @NotBlank
    @Size(max = 64)
    @Column(nullable = false, length = 64)
    private String documentVersion;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime consentedAt;

    /** When the user withdrew optional consent (e.g. marketing). Null if still active. */
    private LocalDateTime withdrawnAt;

    @Size(max = 64)
    private String recordedIp;

    @Size(max = 512)
    private String userAgent;
}
