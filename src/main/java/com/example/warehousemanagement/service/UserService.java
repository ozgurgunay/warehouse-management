package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.UserDTO;
import com.example.warehousemanagement.entity.Role;
import com.example.warehousemanagement.entity.User;
import com.example.warehousemanagement.mapper.UserMapper;
import com.example.warehousemanagement.repository.RoleRepository;
import com.example.warehousemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final VerificationTokenService verificationTokenService;
    private final EmailService emailService;

    @Autowired
    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       UserMapper userMapper,
                       BCryptPasswordEncoder passwordEncoder,
                       VerificationTokenService verificationTokenService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.verificationTokenService = verificationTokenService;
        this.emailService = emailService;
    }

    // Create a new user with associated roles and password encryption
    public UserDTO createUser(UserDTO userDTO, String rawPassword, Set<Long> roleIds) {
        if(rawPassword == null || rawPassword.isEmpty() || rawPassword.length() > 72) {
            throw new IllegalArgumentException("Password must be at 1-72 characters");
        }

        User user = userMapper.userDTOToUser(userDTO);
        user.setPassword(passwordEncoder.encode(rawPassword));
        // fetch and set roles
        Set<Role> roles = roleRepository.findAllById(roleIds).stream().collect(Collectors.toSet());
        user.setRoles(roles);
        // Initially, new users are disabled until email verification.
        user.setEnabled(false);
        User saved = userRepository.save(user);

        // === Create verification token and send confirmation email ===
        var token = verificationTokenService.createToken(saved);
        String confirmUrl = "http://localhost:8080/users/confirm?token=" + token.getToken(); // Adjust host/port as needed
        emailService.sendEmail(
                saved.getEmail(),
                "Email Confirmation",
                "Please click the link to confirm your registration: " + confirmUrl
        );

        return userMapper.userToUserDTO(saved);
    }

    @GetMapping("/confirm")
    public ResponseEntity<String> confirmUser(@RequestParam String token) {
        try {
            verificationTokenService.confirmUser(token);
            return ResponseEntity.ok("Email confirmed! You can now log in.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
    }


    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::userToUserDTO)
                .orElse(null);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::userToUserDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUser(Long id, UserDTO userDTO, Set<Long> roleIds) {
        return userRepository.findById(id).map(existing -> {
            existing.setUsername(userDTO.getUsername());
            existing.setEmail(userDTO.getEmail());
            existing.setEnabled(userDTO.isEnabled());
            // Update roles if provided.
            if (roleIds != null && !roleIds.isEmpty()) {
                Set<Role> roles = roleRepository.findAllById(roleIds).stream().collect(Collectors.toSet());
                existing.setRoles(roles);
            }
            User updated = userRepository.save(existing);
            return userMapper.userToUserDTO(updated);
        }).orElse(null);
    }

    public boolean deleteUser(Long id) {
        if(userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }



}
