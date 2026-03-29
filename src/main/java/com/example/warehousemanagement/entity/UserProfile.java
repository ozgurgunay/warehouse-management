package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Personal and employment-related data (PII), separated from {@link User} for:
 * <ul>
 *   <li>Clear security boundaries and KVKK minimization on the auth entity</li>
 *   <li>Lazy loading — not fetched on login or user list by default</li>
 * </ul>
 * Do not store full national ID in plain text; use {@link #nationalIdLastFour} only if needed for support.
 */
@Data
@Entity
@Table(
        name = "user_profiles",
        indexes = {
                @Index(name = "idx_user_profiles_user_id", columnList = "user_id", unique = true),
                @Index(name = "idx_user_profiles_employee_number", columnList = "employee_number"),
                @Index(name = "idx_user_profiles_department", columnList = "department")
        }
)
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 100)
    private String middleName;

    @Size(max = 32)
    private String mobilePhone;

    @Size(max = 32)
    private String workPhone;

    private LocalDate birthDate;

    @Size(max = 64)
    @Column(unique = true)
    private String employeeNumber;

    @Size(max = 120)
    private String department;

    @Size(max = 120)
    private String jobTitle;

    private LocalDate hireDate;

    @Size(max = 255)
    private String addressLine1;

    @Size(max = 120)
    private String city;

    @Size(max = 24)
    private String postalCode;

    @Size(max = 2)
    private String countryCode;

    @Size(max = 16)
    private String preferredLocale;

    @Size(max = 64)
    private String timeZone;

    /**
     * Last digits only — never store full national ID unencrypted in this column.
     */
    @Size(max = 4)
    private String nationalIdLastFour;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_updated_by_user_id")
    private User lastUpdatedBy;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    @BatchSize(size = 16)
    private List<UserEmergencyContact> emergencyContacts = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @BatchSize(size = 16)
    private List<UserCertification> certifications = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
