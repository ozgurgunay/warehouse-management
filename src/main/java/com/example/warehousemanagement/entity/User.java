package com.example.warehousemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;


@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username can't be blank")
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank(message = "Password can't be blank")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Email can't be blank")
    @Email(message = "Invalid email address")
    @Column(unique = true, nullable = false)
    private String email;

    /**
     * Account active only after explicit confirmation (or admin). DB default false prevents raw SQL inserts from enabling by mistake.
     */
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean enabled = false;

    /**
     * Soft delete timestamp; {@code null} means active (no separate {@code deleted} column in DB).
     */
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by_user_id")
    private User deletedBy;

    // A user can have multiple roles.
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_updated_by_user_id")
    private User lastUpdatedBy;

    /**
     * Personal / HR data — lazy; do not fetch on authentication or bulk user lists.
     */
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private UserProfile profile;

    /**
     * Legal consent audit trail (KVKK). Loaded only when explicitly needed.
     */
    @OneToMany(mappedBy = "user", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @OrderBy("consentedAt DESC")
    private List<UserConsent> consents = new ArrayList<>();

    // Audit fields
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** Not persisted — derived from {@link #deletedAt}. */
    public boolean isDeleted() {
        return deletedAt != null;
    }

}
