package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.RoleDTO;
import com.example.warehousemanagement.entity.Role;
import com.example.warehousemanagement.entity.User;
import com.example.warehousemanagement.exception.BusinessException;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.RoleMapper;
import com.example.warehousemanagement.repository.RoleRepository;
import com.example.warehousemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private static final String SYSTEM_ROLE_USER = "ROLE_USER";
    private static final String SYSTEM_ROLE_ADMIN = "ROLE_ADMIN";

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final UserRepository userRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository, RoleMapper roleMapper, UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
        this.userRepository = userRepository;
    }

    private User requireActiveActor(String actorUsername) {
        return userRepository.findByUsernameAndDeletedAtIsNull(actorUsername)
                .orElseThrow(() -> new NotFoundException("Active user not found for username: " + actorUsername));
    }

    public RoleDTO createRole(RoleDTO dto) {
        Role role = roleMapper.roleDTOToRole(dto);
        Role saved = roleRepository.save(role);
        return roleMapper.roleToRoleDTO(saved);
    }

    public RoleDTO getRoleById(Long id) {
        return roleRepository.findByIdAndDeletedAtIsNull(id)
                .map(roleMapper::roleToRoleDTO)
                .orElseThrow(() -> new NotFoundException("Role not found with id: " + id));
    }

    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAllByDeletedAtIsNullOrderByNameAsc().stream()
                .map(roleMapper::roleToRoleDTO)
                .collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public RoleDTO updateRole(Long id, RoleDTO dto, String actorUsername) {
        User actor = requireActiveActor(actorUsername);
        return roleRepository.findByIdAndDeletedAtIsNull(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            existing.setLastUpdatedBy(actor);
            Role updated = roleRepository.save(existing);
            return roleMapper.roleToRoleDTO(updated);
        }).orElseThrow(() -> new NotFoundException("Role not found with id: " + id));
    }

    @Transactional(rollbackFor = Exception.class)
    public void softDeleteRole(Long id, String actorUsername) {
        User actor = requireActiveActor(actorUsername);
        Role role = roleRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("Role not found with id: " + id));
        if (SYSTEM_ROLE_USER.equals(role.getName()) || SYSTEM_ROLE_ADMIN.equals(role.getName())) {
            throw new BusinessException("System roles cannot be deleted: " + role.getName());
        }
        List<User> assigned = userRepository.findDistinctActiveUsersByRoleId(id);
        for (User u : assigned) {
            u.getRoles().remove(role);
            u.setLastUpdatedBy(actor);
            userRepository.save(u);
        }
        role.setDeletedAt(LocalDateTime.now());
        role.setDeletedBy(actor);
        role.setLastUpdatedBy(actor);
        roleRepository.save(role);
    }
}
