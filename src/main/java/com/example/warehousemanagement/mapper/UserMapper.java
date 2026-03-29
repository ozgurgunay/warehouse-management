package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.RoleDTO;
import com.example.warehousemanagement.dto.UserDTO;
import com.example.warehousemanagement.entity.User;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = { RoleMapper.class, UserProfileMapper.class, UserConsentMapper.class })
public interface UserMapper {

    @Mapping(source = "roles", target = "roleDTOs")
    @Mapping(source = "lastUpdatedBy.username", target = "lastUpdatedByUsername")
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "consents", ignore = true)
    UserDTO toListDto(User user);

    @Mapping(source = "roles", target = "roleDTOs")
    @Mapping(source = "lastUpdatedBy.username", target = "lastUpdatedByUsername")
    @Mapping(source = "profile", target = "profile")
    @Mapping(source = "consents", target = "consents")
    UserDTO toDetailDto(User user);

    @AfterMapping
    default void filterRolesList(User user, @MappingTarget UserDTO dto) {
        filterDeletedRoles(dto);
    }

    @AfterMapping
    default void filterRolesDetail(User user, @MappingTarget UserDTO dto) {
        filterDeletedRoles(dto);
    }

    default void filterDeletedRoles(UserDTO dto) {
        if (dto.getRoleDTOs() == null) {
            return;
        }
        Set<RoleDTO> active = dto.getRoleDTOs().stream()
                .filter(r -> !r.isDeleted())
                .collect(Collectors.toCollection(HashSet::new));
        dto.setRoleDTOs(active);
    }

    @Mapping(source = "roleDTOs", target = "roles")
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "lastUpdatedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "consents", ignore = true)
    User userDTOToUser(UserDTO userDTO);

}
