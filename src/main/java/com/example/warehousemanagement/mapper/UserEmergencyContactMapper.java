package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.UserEmergencyContactDTO;
import com.example.warehousemanagement.entity.UserEmergencyContact;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserEmergencyContactMapper {

    UserEmergencyContactDTO toDto(UserEmergencyContact entity);
}
