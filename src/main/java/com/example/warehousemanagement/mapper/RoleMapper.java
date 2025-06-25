package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.RoleDTO;
import com.example.warehousemanagement.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleDTO roleToRoleDTO(Role role);

    Role roleDTOToRole(RoleDTO roleDTO);

}
