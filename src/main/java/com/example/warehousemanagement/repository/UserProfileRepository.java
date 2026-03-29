package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    boolean existsByEmployeeNumber(String employeeNumber);

    Optional<UserProfile> findByEmployeeNumber(String employeeNumber);
}
