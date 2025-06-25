package com.example.warehousemanagement.service;


import java.util.stream.Collectors;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.example.warehousemanagement.entity.User;
import com.example.warehousemanagement.repository.UserRepository;

@Service
@Primary
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepo;

    // Constructor injection
    public CustomUserDetailsService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User usr = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(usr.getUsername())
                .password(usr.getPassword())
                .authorities(
                        usr.getRoles().stream()
                                .map(r -> new SimpleGrantedAuthority(r.getName()))
                                .collect(Collectors.toList())
                )
                .accountLocked(false)
                .disabled(!usr.isEnabled())
                .build();
    }

}
