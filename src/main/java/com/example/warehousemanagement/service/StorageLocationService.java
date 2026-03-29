package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.StorageLocationDTO;
import com.example.warehousemanagement.dto.StorageLocationStatsDTO;
import com.example.warehousemanagement.entity.StorageLocation;
import com.example.warehousemanagement.entity.Warehouse;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.StorageLocationMapper;
import com.example.warehousemanagement.repository.InventoryRepository;
import com.example.warehousemanagement.repository.StorageLocationRepository;
import com.example.warehousemanagement.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StorageLocationService {

    private final StorageLocationRepository storageLocationRepository;
    private final StorageLocationMapper storageLocationMapper;
    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;

    @Autowired
    public StorageLocationService(
            StorageLocationRepository storageLocationRepository,
            StorageLocationMapper storageLocationMapper,
            InventoryRepository inventoryRepository,
            WarehouseRepository warehouseRepository) {
        this.storageLocationRepository = storageLocationRepository;
        this.storageLocationMapper = storageLocationMapper;
        this.inventoryRepository = inventoryRepository;
        this.warehouseRepository = warehouseRepository;
    }

    @Transactional
    public StorageLocationDTO createStorageLocation(StorageLocationDTO dto) {
        if (dto.getWarehouseId() == null) {
            throw new IllegalArgumentException("Warehouse ID is required for a storage location.");
        }
        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new NotFoundException("Warehouse not found with id: " + dto.getWarehouseId()));

        StorageLocation location = storageLocationMapper.storageLocationDTOToStorageLocation(dto);
        location.setWarehouse(warehouse);

        String requestedCode = normalizeLocationCode(dto.getLocationCode());
        if (requestedCode != null) {
            if (storageLocationRepository.existsByWarehouse_IdAndLocationCodeIgnoreCase(warehouse.getId(), requestedCode)) {
                throw new IllegalArgumentException("Location code already exists in this warehouse.");
            }
            location.setLocationCode(requestedCode);
        } else {
            location.setLocationCode(null);
        }

        StorageLocation saved = storageLocationRepository.save(location);
        if (saved.getLocationCode() == null || saved.getLocationCode().isBlank()) {
            saved.setLocationCode("L-" + String.format("%05d", saved.getId()));
            saved = storageLocationRepository.save(saved);
        }
        return storageLocationMapper.storageLocationToStorageLocationDTO(saved);
    }

    public StorageLocationDTO getStorageLocationById(Long id) {
        return storageLocationRepository.findById(id)
                .map(storageLocationMapper::storageLocationToStorageLocationDTO)
                .orElseThrow(() -> new NotFoundException("Storage location not found with id: " + id));
    }

    public List<StorageLocationDTO> getAllStorageLocations(Long warehouseId) {
        List<StorageLocation> list = warehouseId == null
                ? storageLocationRepository.findAll()
                : storageLocationRepository.findByWarehouse_IdOrderByIdAsc(warehouseId);
        return list.stream()
                .map(storageLocationMapper::storageLocationToStorageLocationDTO)
                .collect(Collectors.toList());
    }

    public StorageLocationStatsDTO getStorageLocationStats(Long warehouseId) {
        long total = warehouseId == null
                ? storageLocationRepository.count()
                : storageLocationRepository.countByWarehouse_Id(warehouseId);
        long occupied = inventoryRepository.countDistinctLocationsWithPositiveStock(warehouseId);
        long empty = Math.max(0, total - occupied);
        double pct = total > 0 ? (occupied * 100.0 / total) : 0.0;
        String hotZone = computeHotZoneLabel(warehouseId);
        return new StorageLocationStatsDTO(total, occupied, empty, pct, hotZone);
    }

    @Transactional
    public StorageLocationDTO updateStorageLocation(Long id, StorageLocationDTO dto) {
        return storageLocationRepository.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setBuilding(dto.getBuilding());
            existing.setFloor(dto.getFloor());
            existing.setSection(dto.getSection());
            existing.setZoneLabel(dto.getZoneLabel());

            String newCode = normalizeLocationCode(dto.getLocationCode());
            if (newCode != null) {
                Long whId = existing.getWarehouse().getId();
                if (storageLocationRepository.existsByWarehouse_IdAndLocationCodeIgnoreCaseAndIdNot(whId, newCode, id)) {
                    throw new IllegalArgumentException("Location code already exists in this warehouse.");
                }
                existing.setLocationCode(newCode);
            }

            StorageLocation updated = storageLocationRepository.save(existing);
            return storageLocationMapper.storageLocationToStorageLocationDTO(updated);
        }).orElseThrow(() -> new NotFoundException("Storage location not found with id: " + id));
    }

    @Transactional
    public void deleteStorageLocation(Long id) {
        StorageLocation loc = storageLocationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Storage location not found with id: " + id));
        long refs = inventoryRepository.countByStorageLocation_Id(id);
        if (refs > 0) {
            throw new IllegalStateException(
                    "Cannot delete storage location: it is still referenced by " + refs + " inventory row(s).");
        }
        storageLocationRepository.delete(loc);
    }

    private static String normalizeLocationCode(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.trim();
        return t.isEmpty() ? null : t;
    }

    private String computeHotZoneLabel(Long warehouseId) {
        List<StorageLocation> all = warehouseId == null
                ? storageLocationRepository.findAll()
                : storageLocationRepository.findByWarehouse_IdOrderByIdAsc(warehouseId);
        Map<String, Long> counts = all.stream()
                .map(StorageLocation::getZoneLabel)
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
        return counts.entrySet().stream()
                .max(Comparator.<Map.Entry<String, Long>>comparingLong(Map.Entry::getValue)
                        .thenComparing(Map.Entry::getKey))
                .map(Map.Entry::getKey)
                .orElse("—");
    }
}
