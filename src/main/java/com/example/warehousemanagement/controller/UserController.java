package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.ConfirmRegistrationRequest;
import com.example.warehousemanagement.dto.RegisteredUserResponse;
import com.example.warehousemanagement.dto.UserDTO;
import com.example.warehousemanagement.dto.UserProfileDTO;
import com.example.warehousemanagement.dto.UserRegistrationRequest;
import com.example.warehousemanagement.exception.BusinessException;
import com.example.warehousemanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Registration endpoint. Accepts basic user details and raw password.
    @PostMapping("/register")
    public ResponseEntity<RegisteredUserResponse> registerUser(@Valid @RequestBody UserRegistrationRequest request,
                                                               Principal principal,
                                                               HttpServletRequest httpRequest) {
        // New accounts always receive default roles from the service; do not trust client-supplied roleIds.
        request.setRoleIds(null);
        String provisioningActor = principal != null ? principal.getName() : null;
        UserDTO created = userService.createUserFromRegistration(
                request,
                provisioningActor,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));
        RegisteredUserResponse body = new RegisteredUserResponse(
                created.getId(),
                created.getUsername(),
                created.getEmail(),
                created.isEnabled());
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Principal principal) {
        UserDTO user = userService.getUserByUsername(principal.getName());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserDTO> updateMyProfile(@Valid @RequestBody UserProfileDTO profileDTO,
                                                   Principal principal) {
        UserDTO updated = userService.updateMyProfile(profileDTO, principal.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * Legacy/bookmark links: redirect to the SPA. Does <strong>not</strong> enable the account — avoids email scanners
     * (Safe Links, etc.) hitting GET and activating the user before the real user opens the mail.
     */
    @GetMapping("/confirm")
    public ResponseEntity<Void> confirmEmailRedirect(@RequestParam String token) {
        String base = frontendBaseUrl == null ? "http://localhost:5173" : frontendBaseUrl.replaceAll("/$", "");
        String location = base + "/confirm-email?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(location)).build();
    }

    /**
     * Actual confirmation — call from the SPA after an explicit user action (button), not from a simple GET.
     */
    @PostMapping("/confirm")
    public ResponseEntity<String> confirmRegistration(@Valid @RequestBody ConfirmRegistrationRequest body) {
        try {
            userService.confirmUserByToken(body.getToken());
            return ResponseEntity.ok("Email confirmed! You can now log in.");
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<UserDTO> updateUserProfile(@PathVariable Long id,
                                                     @Valid @RequestBody UserProfileDTO profileDTO,
                                                     Principal principal) {
        UserDTO updated = userService.updateUserProfile(id, profileDTO, principal.getName());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,
                                              @Valid @RequestBody UserDTO userDTO,
                                              @RequestParam Set<Long> roleIds,
                                              Principal principal) {
        UserDTO updated = userService.updateUser(id, userDTO, roleIds, principal.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Principal principal) {
        userService.softDeleteUser(id, principal.getName());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


}
