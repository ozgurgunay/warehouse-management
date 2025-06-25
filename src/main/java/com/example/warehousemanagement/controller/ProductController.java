package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.ProductDTO;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // create
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        ProductDTO createdProductDTO = productService.createProduct(productDTO);
        return new ResponseEntity<>(createdProductDTO, HttpStatus.CREATED);
    }


    // read all product
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // read by id
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable long id) {
        ProductDTO productDTO = productService.getProductById(id);
        if(productDTO != null) {
            return new ResponseEntity<>(productDTO, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // update
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO updatedProductDTO) {
        ProductDTO productDTO = productService.updateProduct(id, updatedProductDTO);
        if(productDTO != null) {
            return new ResponseEntity<>(productDTO, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Product> deleteProduct(@PathVariable long id) {
        boolean deleted = productService.deleteProduct(id);
        if(deleted) {
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }



}
