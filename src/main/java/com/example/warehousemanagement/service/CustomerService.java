package com.example.warehousemanagement.service;


import com.example.warehousemanagement.dto.CustomerDTO;
import com.example.warehousemanagement.entity.Customer;
import com.example.warehousemanagement.mapper.CustomerMapper;
import com.example.warehousemanagement.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Autowired
    public CustomerService(
            CustomerRepository customerRepository,
            CustomerMapper customerMapper
    ) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    /**
     * creates a new customer record
     */
    public CustomerDTO createCustomer(CustomerDTO dto) {

        // add unique check on email/phone here if needed
        Customer customer = customerMapper.customerDTOToCustomer(dto);
        return customerMapper.customerToCustomerDTO(customerRepository.save(customer));
    }

    /**
     * gets a customer by their id
     */
    public CustomerDTO getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(customerMapper::customerToCustomerDTO)
                .orElse(null);
    }

    /**
     * returns all customers (for admin/reporting)
     */
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(customerMapper::customerToCustomerDTO)
                .collect(Collectors.toList());
    }

    /**
     * Updates customer information
     */
    public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
        return customerRepository.findById(id).map(existing -> {
            existing.setFullName(dto.getFullName());
            existing.setEmail(dto.getEmail());
            existing.setPhone(dto.getPhone());
            existing.setAddress(dto.getAddress());

            return customerMapper.customerToCustomerDTO(customerRepository.save(existing));
        }).orElse(null);
    }

    /**
     * deletes a customer by id
     */
    public boolean deleteCustomer(Long id) {
        if (customerRepository.existsById(id)) {
            customerRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // advanced features
    // - Search by email/phone
    // - Get all orders for a customer
    // - Get all shipments/deliveries for a customer
    // - Blacklist or mark customer as inactive


}
