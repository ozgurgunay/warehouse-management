package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.StorageLocationDTO;
import com.example.warehousemanagement.entity.StorageLocation;
import com.example.warehousemanagement.mapper.StorageLocationMapper;
import com.example.warehousemanagement.repository.StorageLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class StorageLocationService {

    private final StorageLocationRepository storageLocationRepository;
    private final StorageLocationMapper storageLocationMapper;

    @Autowired
    public StorageLocationService(StorageLocationRepository storageLocationRepository,
                                  StorageLocationMapper storageLocationMapper) {
        this.storageLocationRepository = storageLocationRepository;
        this.storageLocationMapper = storageLocationMapper;
    }

    public StorageLocationDTO createStorageLocation(StorageLocationDTO dto) {
        StorageLocation location = storageLocationMapper.storageLocationDTOToStorageLocation(dto);
        StorageLocation saved = storageLocationRepository.save(location);
        return storageLocationMapper.storageLocationToStorageLocationDTO(saved);
    }

    public StorageLocationDTO getStorageLocationById(Long id) {
        return storageLocationRepository.findById(id)
                .map(storageLocationMapper::storageLocationToStorageLocationDTO)
                .orElse(null);
    }

    public List<StorageLocationDTO> getAllStorageLocations() {
        return storageLocationRepository.findAll().stream()
                .map(storageLocationMapper::storageLocationToStorageLocationDTO)
                .collect(Collectors.toList());
    }

    public StorageLocationDTO updateStorageLocation(Long id, StorageLocationDTO dto) {
        return storageLocationRepository.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setBuilding(dto.getBuilding());
            existing.setFloor(dto.getFloor());
            existing.setSection(dto.getSection());
            StorageLocation updated = storageLocationRepository.save(existing);
            return storageLocationMapper.storageLocationToStorageLocationDTO(updated);
        }).orElse(null);
    }

    public boolean deleteStorageLocation(Long id) {
        if (storageLocationRepository.existsById(id)) {
            storageLocationRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
