package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.RoleDTO;
import com.example.warehousemanagement.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(source = "lastUpdatedBy.username", target = "lastUpdatedByUsername")
    @Mapping(target = "deleted", expression = "java(role.getDeletedAt() != null)")
    RoleDTO roleToRoleDTO(Role role);

    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastUpdatedBy", ignore = true)
    Role roleDTOToRole(RoleDTO roleDTO);

}
