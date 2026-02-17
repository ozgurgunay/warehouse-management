package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.QrCodeDTO;
import com.example.warehousemanagement.entity.QrCode;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QrCodeMapper {

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "pkg.id", target = "packageId")
    QrCodeDTO qrCodeToQrCodeDTO(QrCode entity);


    @Mapping(source = "productId", target = "product.id")
    @Mapping(source = "packageId", target = "pkg.id")
    QrCode qrCodeDTOToQrCodeEntity(QrCodeDTO dto);
}
