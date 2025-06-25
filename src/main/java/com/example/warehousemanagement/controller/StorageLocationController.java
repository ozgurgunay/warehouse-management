package com.example.warehousemanagement.controller;


import com.example.warehousemanagement.dto.StorageLocationDTO;
import com.example.warehousemanagement.service.StorageLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/storage-locations")
public class StorageLocationController {

    private final StorageLocationService storageLocationService;

    @Autowired
    public StorageLocationController(StorageLocationService storageLocationService) {
        this.storageLocationService = storageLocationService;
    }

    @PostMapping
    public ResponseEntity<StorageLocationDTO> createStorageLocation(@RequestBody StorageLocationDTO dto) {
        StorageLocationDTO created = storageLocationService.createStorageLocation(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StorageLocationDTO> getStorageLocationById(@PathVariable Long id) {
        StorageLocationDTO dto = storageLocationService.getStorageLocationById(id);
        return dto != null ? new ResponseEntity<>(dto, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping
    public ResponseEntity<List<StorageLocationDTO>> getAllStorageLocations() {
        List<StorageLocationDTO> storageLocationDTOS = storageLocationService.getAllStorageLocations();
        return new ResponseEntity<>(storageLocationDTOS, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StorageLocationDTO> updateStorageLocation(@PathVariable Long id, @RequestBody StorageLocationDTO dto) {
        StorageLocationDTO updated = storageLocationService.updateStorageLocation(id, dto);
        return updated != null ? new ResponseEntity<>(updated, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStorageLocation(@PathVariable Long id) {
        boolean deleted = storageLocationService.deleteStorageLocation(id);
        return deleted ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }


}
