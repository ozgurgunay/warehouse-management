package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.UserConsentDTO;
import com.example.warehousemanagement.entity.UserConsent;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserConsentMapper {

    UserConsentDTO toDto(UserConsent entity);
}
