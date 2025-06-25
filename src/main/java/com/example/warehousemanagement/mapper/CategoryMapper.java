package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.CategoryDTO;
import com.example.warehousemanagement.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

//    Maps Category entity to CategoryDTO.
    CategoryDTO categoryToCategoryDto(Category category);
//    Maps CategoryDTO to Category entity.
    Category categoryDTOToCategory(CategoryDTO categoryDTO);
}
