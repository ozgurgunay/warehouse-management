package com.example.warehousemanagement.repository;

import com.example.warehousemanagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    Optional<Role> findByNameAndDeletedAtIsNull(String name);

    List<Role> findAllByDeletedAtIsNullOrderByNameAsc();

    Optional<Role> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByIdAndDeletedAtIsNull(Long id);
}
