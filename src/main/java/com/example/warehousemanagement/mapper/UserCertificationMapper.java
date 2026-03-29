package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.UserCertificationDTO;
import com.example.warehousemanagement.entity.UserCertification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserCertificationMapper {

    UserCertificationDTO toDto(UserCertification entity);
}
