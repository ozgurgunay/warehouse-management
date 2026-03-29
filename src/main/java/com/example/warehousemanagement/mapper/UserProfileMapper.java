package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.UserProfileDTO;
import com.example.warehousemanagement.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { UserEmergencyContactMapper.class, UserCertificationMapper.class })
public interface UserProfileMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "lastUpdatedBy.username", target = "lastUpdatedByUsername")
    UserProfileDTO toDto(UserProfile profile);
}
