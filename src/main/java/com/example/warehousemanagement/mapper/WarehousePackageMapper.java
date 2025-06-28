package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.WarehousePackageDTO;
import com.example.warehousemanagement.entity.WarehousePackage;
import com.example.warehousemanagement.entity.Barcode;
import com.example.warehousemanagement.entity.QrCode;
import com.example.warehousemanagement.entity.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {PackageItemMapper.class})
public interface WarehousePackageMapper {

    // entity -> DTO
    @Mapping(source = "shipment.id", target = "shipmentId")
    @Mapping(source = "barcode.id", target = "barcodeId")
    @Mapping(source = "qrCode.id", target = "qrCodeId")
    @Mapping(source = "packageType", target = "packageType")
    @Mapping(source = "items", target = "items")
    WarehousePackageDTO warehousePackageToWarehousePackageDTO(WarehousePackage entity);

    // DTO -> entity
    @Mapping(source = "shipmentId", target = "shipment", qualifiedByName = "shipmentFromId")
    @Mapping(source = "barcodeId", target = "barcode", qualifiedByName = "barcodeFromId")
    @Mapping(source = "qrCodeId", target = "qrCode", qualifiedByName = "qrCodeFromId")
    @Mapping(source = "packageType", target = "packageType")
    @Mapping(source = "items", target = "items")
    WarehousePackage warehousePackageDTOToWarehousePackage(WarehousePackageDTO dto);

//    // Yardımcılar (qualifiedByName ile): Bunları da aynı interface’e ekle!
//    MapStruct otomatik olarak objeyi (Shipment), id’ye (Long) veya tam tersini kendiliğinden çeviremiyor.
//    Yani MapStruct şunu anlamıyor:
//
//    DTO’da shipmentId var, entity’de shipment objesi var.
//    Bunları nasıl eşleştireceğim?
//
//    Senin mapping’in yanlış:
//    @Mapping(source = "shipment.id", target = "shipmentId")
//
//    Bu, sadece entity → DTO yönü için çalışır.
//    DTO’dan entity’ye dönerken ise shipmentId’den yeni bir Shipment objesi oluşturulması gerekir.


    @Named("shipmentFromId")
    default Shipment shipmentFromId(Long id) {
        if (id == null) return null;
        Shipment s = new Shipment();
        s.setId(id);
        return s;
    }

    @Named("barcodeFromId")
    default Barcode barcodeFromId(Long id) {
        if (id == null) return null;
        Barcode b = new Barcode();
        b.setId(id);
        return b;
    }

    @Named("qrCodeFromId")
    default QrCode qrCodeFromId(Long id) {
        if (id == null) return null;
        QrCode q = new QrCode();
        q.setId(id);
        return q;
    }


}
