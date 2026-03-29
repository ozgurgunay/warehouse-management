package com.example.warehousemanagement.service;


import com.example.warehousemanagement.constants.LegalDocumentVersions;
import com.example.warehousemanagement.dto.ConsentAcceptanceDTO;
import com.example.warehousemanagement.dto.UserCertificationDTO;
import com.example.warehousemanagement.dto.UserDTO;
import com.example.warehousemanagement.dto.UserEmergencyContactDTO;
import com.example.warehousemanagement.dto.UserProfileDTO;
import com.example.warehousemanagement.dto.UserRegistrationRequest;
import com.example.warehousemanagement.entity.Role;
import com.example.warehousemanagement.entity.User;
import com.example.warehousemanagement.entity.UserCertification;
import com.example.warehousemanagement.entity.UserConsent;
import com.example.warehousemanagement.entity.UserEmergencyContact;
import com.example.warehousemanagement.entity.UserProfile;
import com.example.warehousemanagement.entity.enums.ConsentType;
import com.example.warehousemanagement.exception.BusinessException;
import com.example.warehousemanagement.exception.ForbiddenException;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.UserMapper;
import com.example.warehousemanagement.repository.RoleRepository;
import com.example.warehousemanagement.repository.UserProfileRepository;
import com.example.warehousemanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final VerificationTokenService verificationTokenService;
    private final EmailService emailService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Autowired
    public UserService(UserRepository userRepository,
                       UserProfileRepository userProfileRepository,
                       RoleRepository roleRepository,
                       UserMapper userMapper,
                       BCryptPasswordEncoder passwordEncoder,
                       VerificationTokenService verificationTokenService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.verificationTokenService = verificationTokenService;
        this.emailService = emailService;
    }

    private User requireActiveActor(String actorUsername) {
        return userRepository.findByUsernameAndDeletedAtIsNull(actorUsername)
                .orElseThrow(() -> new NotFoundException("Active user not found for username: " + actorUsername));
    }

    private static String nullableTrim(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String truncate(String value, int maxLen) {
        if (value == null) {
            return null;
        }
        return value.length() <= maxLen ? value : value.substring(0, maxLen);
    }

    /**
     * New accounts must carry a legal identity on the profile (creation flows).
     */
    private void assertMandatoryProfileNames(UserProfileDTO profile) {
        if (profile == null
                || nullableTrim(profile.getFirstName()) == null
                || nullableTrim(profile.getLastName()) == null) {
            throw new BusinessException("First name and last name are required.");
        }
    }

    private boolean profileHasPersonalData(UserProfileDTO profile) {
        if (profile == null) {
            return false;
        }
        return profile.getBirthDate() != null
                || nullableTrim(profile.getFirstName()) != null
                || nullableTrim(profile.getLastName()) != null
                || nullableTrim(profile.getMiddleName()) != null
                || nullableTrim(profile.getMobilePhone()) != null
                || nullableTrim(profile.getWorkPhone()) != null
                || nullableTrim(profile.getNationalIdLastFour()) != null
                || nullableTrim(profile.getAddressLine1()) != null
                || nullableTrim(profile.getEmployeeNumber()) != null;
    }

    private void validateSelfRegistrationConsents(UserRegistrationRequest request) {
        List<ConsentAcceptanceDTO> consents = request.getConsents();
        // EnumSet rejects null elements — filter null consentType to avoid NPE with empty getMessage().
        Set<ConsentType> acceptedTypes = consents.stream()
                .filter(ca -> Boolean.TRUE.equals(ca.getAccepted()))
                .map(ConsentAcceptanceDTO::getConsentType)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(ConsentType.class)));

        if (!acceptedTypes.contains(ConsentType.PRIVACY_NOTICE) || !acceptedTypes.contains(ConsentType.TERMS_OF_USE)) {
            throw new BusinessException("Privacy notice and terms of use must be accepted.");
        }
        if (profileHasPersonalData(request.getProfile()) && !acceptedTypes.contains(ConsentType.EMPLOYEE_PERSONAL_DATA)) {
            throw new BusinessException(
                    "When personal profile data is provided, explicit consent for employee personal data processing is required.");
        }
    }

    private void applyConsents(UserRegistrationRequest request,
                               User user,
                               String provisioningActorUsername,
                               String clientIp,
                               String userAgent) {
        List<ConsentAcceptanceDTO> list = request.getConsents();
        if (list == null || list.isEmpty()) {
            if (provisioningActorUsername == null) {
                throw new BusinessException("Consents are required for self-service registration.");
            }
            UserConsent row = new UserConsent();
            row.setUser(user);
            row.setConsentType(ConsentType.ADMIN_PROVISIONED_ACCOUNT);
            row.setDocumentVersion(LegalDocumentVersions.ADMIN_PROVISION_V1);
            row.setConsentedAt(LocalDateTime.now());
            row.setRecordedIp(truncate(clientIp, 64));
            row.setUserAgent(truncate(userAgent, 512));
            user.getConsents().add(row);
            return;
        }

        validateSelfRegistrationConsents(request);
        for (ConsentAcceptanceDTO ca : list) {
            if (!Boolean.TRUE.equals(ca.getAccepted())) {
                throw new BusinessException("Each declared consent must be accepted.");
            }
            if (ca.getConsentType() == null) {
                throw new BusinessException("Each consent entry must include a consentType.");
            }
            UserConsent row = new UserConsent();
            row.setUser(user);
            row.setConsentType(ca.getConsentType());
            row.setDocumentVersion(nullableTrim(ca.getDocumentVersion()));
            row.setConsentedAt(LocalDateTime.now());
            row.setRecordedIp(truncate(clientIp, 64));
            row.setUserAgent(truncate(userAgent, 512));
            user.getConsents().add(row);
        }
    }

    private void assertEmployeeNumberAvailable(String employeeNumber, Long ownerUserId) {
        if (employeeNumber == null) {
            return;
        }
        userProfileRepository.findByEmployeeNumber(employeeNumber).ifPresent(p -> {
            if (ownerUserId == null || !p.getUser().getId().equals(ownerUserId)) {
                throw new BusinessException("Employee number is already assigned to another profile.");
            }
        });
    }

    private void applyScalarProfileFields(UserProfile profile, UserProfileDTO dto) {
        String employeeNumber = nullableTrim(dto.getEmployeeNumber());
        profile.setFirstName(nullableTrim(dto.getFirstName()));
        profile.setLastName(nullableTrim(dto.getLastName()));
        profile.setMiddleName(nullableTrim(dto.getMiddleName()));
        profile.setMobilePhone(nullableTrim(dto.getMobilePhone()));
        profile.setWorkPhone(nullableTrim(dto.getWorkPhone()));
        profile.setBirthDate(dto.getBirthDate());
        profile.setEmployeeNumber(employeeNumber);
        profile.setDepartment(nullableTrim(dto.getDepartment()));
        profile.setJobTitle(nullableTrim(dto.getJobTitle()));
        profile.setHireDate(dto.getHireDate());
        profile.setAddressLine1(nullableTrim(dto.getAddressLine1()));
        profile.setCity(nullableTrim(dto.getCity()));
        profile.setPostalCode(nullableTrim(dto.getPostalCode()));
        profile.setCountryCode(nullableTrim(dto.getCountryCode()));
        profile.setPreferredLocale(nullableTrim(dto.getPreferredLocale()));
        profile.setTimeZone(nullableTrim(dto.getTimeZone()));
        String lastFour = nullableTrim(dto.getNationalIdLastFour());
        if (lastFour != null && lastFour.length() > 4) {
            throw new BusinessException("nationalIdLastFour must be at most 4 characters.");
        }
        profile.setNationalIdLastFour(lastFour);
    }

    private void addEmergencyContactsFromDto(UserProfile profile, UserProfileDTO dto) {
        if (dto.getEmergencyContacts() == null) {
            return;
        }
        int idx = 0;
        for (UserEmergencyContactDTO ecDto : dto.getEmergencyContacts()) {
            UserEmergencyContact ec = new UserEmergencyContact();
            ec.setProfile(profile);
            ec.setFullName(nullableTrim(ecDto.getFullName()));
            ec.setRelationship(nullableTrim(ecDto.getRelationship()));
            ec.setPhonePrimary(nullableTrim(ecDto.getPhonePrimary()));
            ec.setPhoneSecondary(nullableTrim(ecDto.getPhoneSecondary()));
            int order = ecDto.getSortOrder() != 0 ? ecDto.getSortOrder() : idx++;
            ec.setSortOrder(order);
            profile.getEmergencyContacts().add(ec);
        }
    }

    private void addCertificationsFromDto(UserProfile profile, UserProfileDTO dto) {
        if (dto.getCertifications() == null) {
            return;
        }
        for (UserCertificationDTO cDto : dto.getCertifications()) {
            UserCertification cert = new UserCertification();
            cert.setProfile(profile);
            cert.setCertificationType(nullableTrim(cDto.getCertificationType()));
            cert.setCertificateNumber(nullableTrim(cDto.getCertificateNumber()));
            cert.setIssuedAt(cDto.getIssuedAt());
            cert.setExpiresAt(cDto.getExpiresAt());
            cert.setIssuerName(nullableTrim(cDto.getIssuerName()));
            profile.getCertifications().add(cert);
        }
    }

    private void attachProfile(User user, UserProfileDTO dto) {
        String employeeNumber = nullableTrim(dto.getEmployeeNumber());
        assertEmployeeNumberAvailable(employeeNumber, user.getId());

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        applyScalarProfileFields(profile, dto);
        addEmergencyContactsFromDto(profile, dto);
        addCertificationsFromDto(profile, dto);

        user.setProfile(profile);
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) && !r.isDeleted());
    }

    @Transactional(rollbackFor = Exception.class)
    public UserDTO createUserFromRegistration(UserRegistrationRequest request,
                                              String provisioningActorUsername,
                                              String clientIp,
                                              String userAgent) {
        if (request.getPassword() == null || request.getPassword().isEmpty() || request.getPassword().length() > 72) {
            throw new IllegalArgumentException("Password must be at 1-72 characters");
        }

        UserDTO minimal = new UserDTO();
        minimal.setUsername(request.getUsername());
        minimal.setEmail(request.getEmail());
        User user = userMapper.userDTOToUser(minimal);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Set<Long> roleIds = request.getRoleIds();
        if (roleIds == null || roleIds.isEmpty()) {
            Role defaultRole = roleRepository.findByNameAndDeletedAtIsNull("ROLE_USER")
                    .orElseThrow(() -> new IllegalStateException("Default role ROLE_USER not found"));
            user.setRoles(Set.of(defaultRole));
        } else {
            Set<Role> roles = roleRepository.findAllById(roleIds).stream()
                    .filter(r -> !r.isDeleted())
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }
        user.setEnabled(false);

        User saved = userRepository.save(user);

        assertMandatoryProfileNames(request.getProfile());
        attachProfile(saved, request.getProfile());

        applyConsents(request, saved, provisioningActorUsername, clientIp, userAgent);

        userRepository.save(saved);

        var token = verificationTokenService.createToken(saved);
        String base = frontendBaseUrl == null ? "http://localhost:5173" : frontendBaseUrl.replaceAll("/$", "");
        String confirmUrl = base + "/confirm-email?token="
                + URLEncoder.encode(token.getToken(), StandardCharsets.UTF_8);
        final String recipientEmail = saved.getEmail();
        final String emailBody =
                "Confirm your registration by opening this link, then click the confirm button on the page (required so automated mail scanners cannot activate your account):\n"
                        + confirmUrl;
        Runnable sendConfirmationEmail = () -> {
            try {
                emailService.sendEmail(recipientEmail, "Email Confirmation", emailBody);
            } catch (Exception ex) {
                log.warn("Failed to send registration confirmation email to {}", recipientEmail, ex);
            }
        };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendConfirmationEmail.run();
                }
            });
        } else {
            log.warn("No active transaction synchronization; sending registration email outside afterCommit hook.");
            sendConfirmationEmail.run();
        }

        User reloaded = userRepository.findByIdAndDeletedAtIsNullWithProfileAndConsents(saved.getId())
                .orElse(saved);
        return userMapper.toDetailDto(reloaded);
    }

    public void confirmUserByToken(String token) {
        verificationTokenService.confirmUser(token);
    }

    public UserDTO getUserByUsername(String username) {
        return userRepository.findByUsernameAndDeletedAtIsNullWithProfile(username)
                .map(userMapper::toDetailDto)
                .orElseThrow(() -> new NotFoundException("User not found with username: " + username));
    }

    public UserDTO getUserById(Long id) {
        return userRepository.findByIdAndDeletedAtIsNullWithProfileAndConsents(id)
                .map(userMapper::toDetailDto)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAllByDeletedAtIsNullOrderByUsernameAsc().stream()
                .map(userMapper::toListDto)
                .collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public UserDTO updateUser(Long id, UserDTO userDTO, Set<Long> roleIds, String actorUsername) {
        User actor = requireActiveActor(actorUsername);
        return userRepository.findByIdAndDeletedAtIsNull(id).map(existing -> {
            existing.setUsername(userDTO.getUsername());
            existing.setEmail(userDTO.getEmail());
            existing.setEnabled(userDTO.isEnabled());
            existing.setLastUpdatedBy(actor);
            if (roleIds != null && !roleIds.isEmpty()) {
                Set<Role> roles = roleRepository.findAllById(roleIds).stream()
                        .filter(r -> !r.isDeleted())
                        .collect(Collectors.toSet());
                existing.setRoles(roles);
            }
            User updated = userRepository.save(existing);
            User reloaded = userRepository.findByIdAndDeletedAtIsNullWithProfileAndConsents(updated.getId())
                    .orElse(updated);
            return userMapper.toDetailDto(reloaded);
        }).orElseThrow(() -> new NotFoundException("User not found with id: " + id));
    }

    @Transactional(rollbackFor = Exception.class)
    public void softDeleteUser(Long id, String actorUsername) {
        User actor = requireActiveActor(actorUsername);
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        if (user.getId().equals(actor.getId())) {
            throw new BusinessException("You cannot delete your own account");
        }
        user.setDeletedAt(LocalDateTime.now());
        user.setDeletedBy(actor);
        user.setLastUpdatedBy(actor);
        userRepository.save(user);
    }

    /**
     * Updates profile and nested emergency contacts / certifications (replaces lists from DTO).
     * Allowed for the account owner or an administrator.
     */
    @Transactional(rollbackFor = Exception.class)
    public UserDTO updateUserProfile(Long userId, UserProfileDTO dto, String actorUsername) {
        User actor = requireActiveActor(actorUsername);
        User target = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        if (!isAdmin(actor) && !actor.getId().equals(target.getId())) {
            throw new ForbiddenException("You are not allowed to update this user profile.");
        }

        assertMandatoryProfileNames(dto);

        assertEmployeeNumberAvailable(nullableTrim(dto.getEmployeeNumber()), target.getId());

        UserProfile profile = target.getProfile();
        if (profile == null) {
            attachProfile(target, dto);
            profile = target.getProfile();
        } else {
            applyScalarProfileFields(profile, dto);
            profile.getEmergencyContacts().clear();
            profile.getCertifications().clear();
            addEmergencyContactsFromDto(profile, dto);
            addCertificationsFromDto(profile, dto);
        }
        profile.setLastUpdatedBy(actor);
        userRepository.save(target);

        User reloaded = userRepository.findByIdAndDeletedAtIsNullWithProfileAndConsents(userId).orElse(target);
        return userMapper.toDetailDto(reloaded);
    }

    @Transactional(rollbackFor = Exception.class)
    public UserDTO updateMyProfile(UserProfileDTO dto, String username) {
        User me = userRepository.findByUsernameAndDeletedAtIsNull(username)
                .orElseThrow(() -> new NotFoundException("User not found with username: " + username));
        return updateUserProfile(me.getId(), dto, username);
    }
}
