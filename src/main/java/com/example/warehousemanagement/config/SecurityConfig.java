package com.example.warehousemanagement.config;

import com.example.warehousemanagement.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * DaoAuthenticationProvider, CustomUserDetailsService + BCryptPasswordEncoder
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Asıl HTTP security chain:
     *  - DaoAuthenticationProvider is added
     *  - Basic Auth is active
     *  - CSRF is made readable via cookie + header
     *  - /csrf GET is public
     *  - /roles/**  must have ADMIN role
     *  - others are authenticated
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1) DB’den kullanıcı doğrulamak için
                .authenticationProvider(authenticationProvider())

                // 2) HTTP Basic Auth
                .httpBasic(Customizer.withDefaults())

                // 3) CSRF token'ını JS/SPA/Postman’in okuyabileceği cookie’de sakla
                .csrf(csrf -> csrf.disable())


                // 4) Yetkilendirme kuralları
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/register").permitAll()
                        .requestMatchers("/roles/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                );

        return http.build();
    }

}
