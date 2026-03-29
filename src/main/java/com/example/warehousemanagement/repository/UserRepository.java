package com.example.warehousemanagement.repository;


import com.example.warehousemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndDeletedAtIsNull(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByIdAndDeletedAtIsNull(Long id);

    List<User> findAllByDeletedAtIsNullOrderByUsernameAsc();

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.id = :roleId AND u.deletedAt IS NULL")
    List<User> findDistinctActiveUsersByRoleId(@Param("roleId") Long roleId);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.profile WHERE u.username = :username AND u.deletedAt IS NULL")
    Optional<User> findByUsernameAndDeletedAtIsNullWithProfile(@Param("username") String username);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.profile LEFT JOIN FETCH u.consents WHERE u.id = :id AND u.deletedAt IS NULL")
    Optional<User> findByIdAndDeletedAtIsNullWithProfileAndConsents(@Param("id") Long id);
}
