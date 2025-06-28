package com.example.warehousemanagement.mapper;


import com.example.warehousemanagement.dto.BarcodeDTO;
import com.example.warehousemanagement.entity.Barcode;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BarcodeMapper {

    BarcodeDTO barcodeToBarcodeDTO(Barcode entity);
    Barcode barcodeDTOToBarcode(BarcodeDTO dto);
}
