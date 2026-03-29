package com.example.warehousemanagement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class UserRegistrationRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 1, max = 72, message = "Password must be between 1 and 72 characters")
    private String password;

    private Set<Long> roleIds;

    /**
     * Employee profile. {@link UserProfileDTO#getFirstName()} and {@link UserProfileDTO#getLastName()}
     * are required for every new account (validated in service).
     */
    @NotNull(message = "Profile is required")
    @Valid
    private UserProfileDTO profile;

    /**
     * Required for public self-registration. When an authenticated administrator calls the endpoint,
     * this may be omitted — a provisioning consent record is stored instead.
     */
    @Valid
    private List<ConsentAcceptanceDTO> consents;
}

