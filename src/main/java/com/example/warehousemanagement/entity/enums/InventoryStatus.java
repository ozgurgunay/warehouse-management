package com.example.warehousemanagement.entity.enums;

public enum InventoryStatus {
    AVAILABLE,      // Satılabilir, sağlam stok
    RESERVED,       // Sipariş geldi, ayrıldı ama henüz çıkmadı
    QUARANTINE,     // Yeni geldi veya iade döndü, kontrol ediliyor (Satılamaz)
    DAMAGED,        // Hasarlı (Satılamaz)
    MISSING,        // Sayımda bulunamadı (Satılamaz)
    EXPIRED         // SKT geçti (Satılamaz)
}
