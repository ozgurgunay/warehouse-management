package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.CategoryDTO;
import com.example.warehousemanagement.entity.Category;
import com.example.warehousemanagement.entity.enums.CategoryStatus;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.repository.CategoryRepository;
import com.example.warehousemanagement.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    private CategoryDTO mapToCategoryDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setStatus(category.getStatus());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }

    private void enrichProductCount(CategoryDTO dto) {
        if (dto.getId() != null) {
            dto.setProductCount(productRepository.countByCategory_Id(dto.getId()));
        }
    }

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        if (categoryDTO.getStatus() != null) {
            category.setStatus(categoryDTO.getStatus());
        } else {
            category.setStatus(CategoryStatus.ACTIVE);
        }
        Category saved = categoryRepository.save(category);
        CategoryDTO dto = mapToCategoryDTO(saved);
        enrichProductCount(dto);
        return dto;
    }

    public CategoryDTO getCategoryById(Long id) {
        CategoryDTO dto = categoryRepository.findById(id)
                .map(this::mapToCategoryDTO)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + id));
        enrichProductCount(dto);
        return dto;
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToCategoryDTO)
                .peek(this::enrichProductCount)
                .collect(Collectors.toList());
    }

    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        return categoryRepository.findById(id).map(existing -> {
            existing.setName(categoryDTO.getName());
            existing.setDescription(categoryDTO.getDescription());
            if (categoryDTO.getStatus() != null) {
                existing.setStatus(categoryDTO.getStatus());
            }
            Category updated = categoryRepository.save(existing);
            CategoryDTO dto = mapToCategoryDTO(updated);
            enrichProductCount(dto);
            return dto;
        }).orElseThrow(() -> new NotFoundException("Category not found with id: " + id));
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new NotFoundException("Category not found with id: " + id);
        }
        long assigned = productRepository.countByCategory_Id(id);
        if (assigned > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot delete category with assigned products. Reassign products first.");
        }
        categoryRepository.deleteById(id);
    }

}
