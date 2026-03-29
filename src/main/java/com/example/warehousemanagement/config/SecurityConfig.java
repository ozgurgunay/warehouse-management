package com.example.warehousemanagement.config;

import com.example.warehousemanagement.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

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

                // 2.1) Allow browser-based frontend to call REST APIs
                .cors(Customizer.withDefaults())

                // 3) CSRF token'ını JS/SPA/Postman’in okuyabileceği cookie’de sakla
                .csrf(csrf -> csrf.disable())


                // 4) Yetkilendirme kuralları
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/register").permitAll()
                        .requestMatchers("/users/confirm").permitAll()
                        .requestMatchers(HttpMethod.GET, "/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/users/me/profile").authenticated()
                        .requestMatchers("/users/**").hasRole("ADMIN")
                        .requestMatchers("/roles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/products/**").permitAll()
                        // Development-friendly: allow the frontend to read warehouses without auth
                        .requestMatchers(HttpMethod.GET, "/warehouses/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/storage-locations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/inventory/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/stock-movements/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/inventory-allocations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/shipments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/customers/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/orders/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/order-items/**").permitAll()
                        // Allow preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("authorization", "content-type", "x-requested-with"));
        configuration.setExposedHeaders(List.of("location"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
