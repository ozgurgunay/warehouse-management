package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.CategoryDTO;
import com.example.warehousemanagement.entity.Category;
import com.example.warehousemanagement.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

//    convert Category entity to CategoryDTO
    private CategoryDTO mapToCategoryDTO(Category category) {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setId(category.getId());
        categoryDTO.setName(category.getName());
        categoryDTO.setDescription(category.getDescription());
        return categoryDTO;
    }

//    convert CategoryDTO to entity
    private Category mapToEntity(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setId(categoryDTO.getId());
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        return category;
    }

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = mapToEntity(categoryDTO);
        Category savedCategory = categoryRepository.save(category);
        return mapToCategoryDTO(savedCategory);
    }

    public CategoryDTO getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(this::mapToCategoryDTO)
                .orElse(null);
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToCategoryDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        return categoryRepository.findById(id).map(existing -> {
            existing.setName(categoryDTO.getName());
            existing.setDescription(categoryDTO.getDescription());
            Category updatedCategory = categoryRepository.save(existing);
            return mapToCategoryDTO(updatedCategory);
        }).orElse(null);
    }

    public boolean deleteCategory(Long id) {
        if(categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
