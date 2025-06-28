package com.example.warehousemanagement.mapper;

import com.example.warehousemanagement.dto.CustomerDTO;
import com.example.warehousemanagement.entity.Customer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    CustomerDTO customerToCustomerDTO(Customer entity);
    Customer customerDTOToCustomer(CustomerDTO dto);
}
