package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.ProductDTO;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.exception.NotFoundException;
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

    // Create product with optional category relation
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = productMapper.productDTOToProduct(dto);

        if (dto.getCategoryId() != null) {
            product.setCategory(
                    categoryRepository.findById(dto.getCategoryId())
                            .orElseThrow(() -> new NotFoundException("Category not found with id: " + dto.getCategoryId()))
            );
        } else {
            product.setCategory(null);
        }

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

    // Get product by id
    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::productToProductDTO)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
    }

    // Update product
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(productDTO.getName());
            existing.setSku(productDTO.getSku());
            existing.setPrice(productDTO.getPrice());
            existing.setDescription(productDTO.getDescription());
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

            if (productDTO.getCategoryId() != null) {
                existing.setCategory(
                        categoryRepository.findById(productDTO.getCategoryId())
                                .orElseThrow(() -> new NotFoundException("Category not found with id: " + productDTO.getCategoryId()))
                );
            } else {
                existing.setCategory(null);
            }

            Product updated = productRepository.save(existing);
            return productMapper.productToProductDTO(updated);
        }).orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
    }

    // Delete product
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }



}
