package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.PackageItemDTO;
import com.example.warehousemanagement.entity.PackageItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PackageItemMapper {

    @Mapping(source = "pkg.id", target = "packageId")
    @Mapping(source = "product.id", target = "productId")
    PackageItemDTO packageItemToPackageItemDTO(PackageItem entity);

    @Mapping(source = "packageId", target = "pkg.id")
    @Mapping(source = "productId", target = "product.id")
    PackageItem packageItemDTOToPackageItem(PackageItemDTO dto);

}
