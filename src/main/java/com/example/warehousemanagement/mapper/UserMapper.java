package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.UserDTO;
import com.example.warehousemanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

//parameter tells MapStruct to use the RoleMapper to convert the roles field from User (a set of Role entities) to UserDTO (a set of RoleDTO objects)
@Mapper(componentModel = "spring", uses = { RoleMapper.class })
public interface UserMapper {

    @Mapping(source = "roles", target = "roleDTOs")  // Map 'roles' from User to 'roleDTOs' in UserDTO
    UserDTO userToUserDTO(User user);

    @Mapping(source = "roleDTOs", target = "roles")  // Map 'roleDTOs' from UserDTO to 'roles' in User
    User userDTOToUser(UserDTO userDTO);

}
