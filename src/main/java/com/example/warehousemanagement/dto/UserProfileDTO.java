package com.example.warehousemanagement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class UserProfileDTO {

    private Long id;
    private Long userId;

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

    @Size(max = 4)
    private String nationalIdLastFour;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String lastUpdatedByUsername;

    @Valid
    private List<UserEmergencyContactDTO> emergencyContacts = new ArrayList<>();

    @Valid
    private List<UserCertificationDTO> certifications = new ArrayList<>();
}
