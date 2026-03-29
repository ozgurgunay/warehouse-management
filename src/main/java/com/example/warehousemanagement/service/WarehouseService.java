package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.WarehouseDTO;
import com.example.warehousemanagement.dto.WarehouseStatsDTO;
import com.example.warehousemanagement.entity.Warehouse;
import com.example.warehousemanagement.entity.enums.WarehouseStatus;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.WarehouseMapper;
import com.example.warehousemanagement.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    @Autowired
    public WarehouseService(WarehouseRepository warehouseRepository, WarehouseMapper warehouseMapper) {
        this.warehouseRepository = warehouseRepository;
        this.warehouseMapper = warehouseMapper;
    }

    public WarehouseDTO createWarehouse(WarehouseDTO dto) {
        validateOccupancy(dto);
        Warehouse warehouse = warehouseMapper.warehouseDTOToWarehouse(dto);
        if (warehouse.getStatus() == null) {
            warehouse.setStatus(WarehouseStatus.ACTIVE);
        }
        String requestedCode = normalizeWarehouseCode(dto.getWarehouseCode());
        if (requestedCode != null) {
            if (warehouseRepository.existsByWarehouseCodeIgnoreCase(requestedCode)) {
                throw new IllegalArgumentException("Warehouse code already exists.");
            }
            warehouse.setWarehouseCode(requestedCode);
        } else {
            warehouse.setWarehouseCode(null);
        }

        Warehouse saved = warehouseRepository.save(warehouse);
        if (saved.getWarehouseCode() == null || saved.getWarehouseCode().isBlank()) {
            saved.setWarehouseCode("WH-" + String.format("%05d", saved.getId()));
            saved = warehouseRepository.save(saved);
        }
        return warehouseMapper.warehouseToWarehouseDTO(saved);
    }

    public WarehouseDTO getWarehouseById(Long id) {
        return warehouseRepository.findById(id)
                .map(warehouseMapper::warehouseToWarehouseDTO)
                .orElseThrow(() -> new NotFoundException("Warehouse not found with id: " + id));
    }

    public List<WarehouseDTO> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(warehouseMapper::warehouseToWarehouseDTO)
                .collect(Collectors.toList());
    }

    public WarehouseStatsDTO getWarehouseStats() {
        List<Warehouse> all = warehouseRepository.findAll();
        long total = all.size();
        long sumMax = all.stream()
                .map(Warehouse::getMaxCapacityM2)
                .filter(Objects::nonNull)
                .mapToLong(Long::longValue)
                .sum();
        long sumOcc = all.stream()
                .map(Warehouse::getOccupiedM2)
                .filter(Objects::nonNull)
                .mapToLong(Long::longValue)
                .sum();
        double avgOcc = sumMax > 0 ? (sumOcc * 100.0 / sumMax) : 0.0;
        return new WarehouseStatsDTO(total, avgOcc, sumMax);
    }

    public WarehouseDTO updateWarehouse(Long id, WarehouseDTO dto) {
        validateOccupancy(dto);
        return warehouseRepository.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setLocation(dto.getLocation());
            existing.setRegion(dto.getRegion());
            if (dto.getStatus() != null) {
                existing.setStatus(dto.getStatus());
            }
            existing.setMaxCapacityM2(dto.getMaxCapacityM2());
            existing.setOccupiedM2(dto.getOccupiedM2());
            existing.setContactNumber(dto.getContactNumber());

            String newCode = normalizeWarehouseCode(dto.getWarehouseCode());
            if (newCode != null) {
                if (warehouseRepository.existsByWarehouseCodeIgnoreCaseAndIdNot(newCode, id)) {
                    throw new IllegalArgumentException("Warehouse code already exists.");
                }
                existing.setWarehouseCode(newCode);
            }

            Warehouse updated = warehouseRepository.save(existing);
            return warehouseMapper.warehouseToWarehouseDTO(updated);
        }).orElseThrow(() -> new NotFoundException("Warehouse not found with id: " + id));
    }

    public void deleteWarehouse(Long id) {
        if (!warehouseRepository.existsById(id)) {
            throw new NotFoundException("Warehouse not found with id: " + id);
        }
        warehouseRepository.deleteById(id);
    }

    private static String normalizeWarehouseCode(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.trim();
        return t.isEmpty() ? null : t;
    }

    private static void validateOccupancy(WarehouseDTO dto) {
        Long max = dto.getMaxCapacityM2();
        Long occ = dto.getOccupiedM2();
        if (max != null && max < 0) {
            throw new IllegalArgumentException("Maximum capacity cannot be negative.");
        }
        if (occ != null && occ < 0) {
            throw new IllegalArgumentException("Occupied area cannot be negative.");
        }
        if (max != null && occ != null && occ > max) {
            throw new IllegalArgumentException("Occupied area cannot exceed maximum capacity.");
        }
    }
}
