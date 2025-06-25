package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.ProductDTO;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.mapper.ProductMapper;
import com.example.warehousemanagement.repository.CategoryRepository;
import com.example.warehousemanagement.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, ProductMapper productMapper, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.categoryRepository = categoryRepository;
    }

    //    create product
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = productMapper.productDTOToProduct(dto);
        Product savedProduct = productRepository.save(product);
        // Convert saved entity back to DTO
        return productMapper.productToProductDTO(savedProduct);
    }

    //    get product
    public List<ProductDTO> getAllProducts() {
        return  productRepository.findAll().stream()
                .map(productMapper::productToProductDTO)
                .collect(Collectors.toList());
    }

    //    get product by id
    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::productToProductDTO)
                .orElse(null);
    }

    //    update product
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(productDTO.getName());
            existing.setSku(productDTO.getSku());
            existing.setPrice(productDTO.getPrice());
            existing.setDescription(productDTO.getDescription());
            existing.setCategory(categoryRepository.findById(productDTO.getCategoryId()).orElse(null));
            existing.setUpdatedBy(productDTO.getUpdatedBy());

            if (productDTO.getCategoryId() != null) {
                existing.setCategory(
                        categoryRepository.findById(productDTO.getCategoryId())
                                .orElse(null)
                );
            } else {
                existing.setCategory(null);
            }

            // Note: createdAt and updatedAt are managed automatically via @PrePersist and @PreUpdate

            Product updated = productRepository.save(existing);
            return productMapper.productToProductDTO(updated);
        }).orElse(null);
    }

    //    delete product
    public boolean deleteProduct(Long id) {
        if(productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }



}
