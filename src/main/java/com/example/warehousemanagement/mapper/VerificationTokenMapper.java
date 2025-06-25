package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.VerificationTokenDTO;
import com.example.warehousemanagement.entity.VerificationToken;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface VerificationTokenMapper {

    // Map VerificationToken entity to VerificationTokenDTO.
    // We use an expression to extract the associated user's id.
    @Mapping(target = "userId", expression = "java(verificationToken.getUser() != null ? verificationToken.getUser().getId() : null)")
    VerificationTokenDTO verificationTokenToVerificationTokenDTO(VerificationToken verificationToken);

    // Map VerificationTokenDTO to VerificationToken.
    // We ignore the user field, which should be set separately.
    @Mapping(target = "user", ignore = true)
    VerificationToken verificationTokenDTOToVerificationToken(VerificationTokenDTO dto);

}
