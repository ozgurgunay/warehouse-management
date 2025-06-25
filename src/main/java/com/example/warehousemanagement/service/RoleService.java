package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.RoleDTO;
import com.example.warehousemanagement.entity.Role;
import com.example.warehousemanagement.mapper.RoleMapper;
import com.example.warehousemanagement.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Autowired
    public RoleService(RoleRepository roleRepository, RoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
    }

    public RoleDTO createRole(RoleDTO dto) {
        Role role = roleMapper.roleDTOToRole(dto);
        Role saved = roleRepository.save(role);
        return roleMapper.roleToRoleDTO(saved);
    }

    public RoleDTO getRoleById(Long id) {
        return roleRepository.findById(id)
                .map(roleMapper::roleToRoleDTO)
                .orElse(null);
    }

    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(roleMapper::roleToRoleDTO)
                .collect(Collectors.toList());
    }

    public RoleDTO updateRole(Long id, RoleDTO dto) {
        return roleRepository.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            Role updated = roleRepository.save(existing);
            return roleMapper.roleToRoleDTO(updated);
        }).orElse(null);
    }

    public boolean deleteRole(Long id) {
        if(roleRepository.existsById(id)){
            roleRepository.deleteById(id);
            return true;
        }
        return false;
    }


}
