package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.WarehouseDTO;
import com.example.warehousemanagement.entity.Warehouse;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.WarehouseMapper;
import com.example.warehousemanagement.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
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
        Warehouse warehouse = warehouseMapper.warehouseDTOToWarehouse(dto);
        Warehouse saved = warehouseRepository.save(warehouse);
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

    public WarehouseDTO updateWarehouse(Long id, WarehouseDTO dto) {
        return warehouseRepository.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setLocation(dto.getLocation());
            existing.setCapacity(dto.getCapacity());
            existing.setContactNumber(dto.getContactNumber());
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

}
