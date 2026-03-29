package com.example.warehousemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Minimal payload for {@code POST /users/register} — avoids large nested graphs during JSON serialization.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisteredUserResponse {

    private Long id;
    private String username;
    private String email;
    private boolean enabled;
}
