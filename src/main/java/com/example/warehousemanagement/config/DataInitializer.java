package com.example.warehousemanagement.config;

import com.example.warehousemanagement.entity.Customer;
import com.example.warehousemanagement.entity.Role;
import com.example.warehousemanagement.entity.User;
import com.example.warehousemanagement.entity.UserProfile;
import com.example.warehousemanagement.repository.CustomerRepository;
import com.example.warehousemanagement.repository.RoleRepository;
import com.example.warehousemanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedRolesAndAdmin(
            RoleRepository roleRepository,
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        return args -> {
            Role roleUser = roleRepository.findByNameAndDeletedAtIsNull("ROLE_USER")
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setName("ROLE_USER");
                        r.setDescription("Default application user role");
                        return roleRepository.save(r);
                    });

            Role roleAdmin = roleRepository.findByNameAndDeletedAtIsNull("ROLE_ADMIN")
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setName("ROLE_ADMIN");
                        r.setDescription("Administrator role");
                        return roleRepository.save(r);
                    });

            userRepository.findByUsernameAndDeletedAtIsNull("admin")
                    .orElseGet(() -> {
                        User u = new User();
                        u.setUsername("admin");
                        u.setEmail("admin@example.com");
                        u.setPassword(passwordEncoder.encode("admin123"));
                        u.setRoles(Set.of(roleAdmin, roleUser));
                        u.setEnabled(true);
                        User saved = userRepository.save(u);
                        UserProfile profile = new UserProfile();
                        profile.setUser(saved);
                        profile.setFirstName("System");
                        profile.setLastName("Administrator");
                        saved.setProfile(profile);
                        return userRepository.save(saved);
                    });
        };
    }

    @Bean
    public CommandLineRunner seedSampleCustomers(CustomerRepository customerRepository) {
        return args -> {
            if (customerRepository.count() > 0) {
                return;
            }
            Customer c1 = new Customer();
            c1.setFullName("Northwind Trading Co.");
            c1.setEmail("orders@northwind.example.com");
            c1.setPhone("+44 20 7946 0958");
            c1.setCompanyName("Northwind Trading Co.");
            c1.setTaxNumber("GB123456789");
            c1.setAddress("221B Baker Street, London, UK");

            Customer c2 = new Customer();
            c2.setFullName("Maria García");
            c2.setEmail("maria.garcia@email.example");
            c2.setPhone("+34 91 555 0142");
            c2.setCompanyName(null);
            c2.setTaxNumber(null);
            c2.setAddress("Calle Mayor 12, Madrid, Spain");

            Customer c3 = new Customer();
            c3.setFullName("TechParts GmbH");
            c3.setEmail("einkauf@techparts.example.de");
            c3.setPhone("+49 30 22154321");
            c3.setCompanyName("TechParts GmbH");
            c3.setTaxNumber("DE998877665");
            c3.setAddress("Alexanderplatz 7, 10178 Berlin, Germany");

            Customer c4 = new Customer();
            c4.setFullName("James Chen");
            c4.setEmail("j.chen@retail.example.com");
            c4.setPhone("+1 415 555 0199");
            c4.setCompanyName("Bay Area Retail LLC");
            c4.setTaxNumber("US-12-3456789");
            c4.setAddress("500 Howard St, San Francisco, CA, USA");

            customerRepository.saveAll(List.of(c1, c2, c3, c4));
        };
    }
}

