package com.example.warehousemanagement.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UserRegistrationRequest {

    private String username;
    private String email;
    private String password;
    private Set<Long> roleIds;
}

