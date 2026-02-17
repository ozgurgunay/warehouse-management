package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.OrderDTO;
import com.example.warehousemanagement.entity.Order;
import com.example.warehousemanagement.entity.enums.OrderStatus;
import com.example.warehousemanagement.entity.enums.PaymentStatus;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.mapper.OrderMapper;
import com.example.warehousemanagement.repository.CustomerRepository;
import com.example.warehousemanagement.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final CustomerRepository customerRepository;


    @Autowired
    public OrderService(OrderRepository orderRepository, OrderMapper orderMapper, CustomerRepository customerRepository) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.customerRepository = customerRepository;
    }

    // create a new order
    public OrderDTO createOrder(OrderDTO dto) {
        Order order = orderMapper.orderDTOToOrder(dto);
        order.setCustomer(customerRepository.findById(dto.getCustomerId()).orElse(null));
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setShipmentStatus(ShipmentStatus.PENDING);
        return orderMapper.orderToOrderDTO(orderRepository.save(order));
    }

    // get all orders
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::orderToOrderDTO)
                .collect(Collectors.toList());
    }

    // get a single order by ID
    public OrderDTO getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(orderMapper::orderToOrderDTO)
                .orElse(null);
    }

    // get all orders for a specific customer
    public List<OrderDTO> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId)
                .stream().map(orderMapper::orderToOrderDTO)
                .collect(Collectors.toList());
    }

    // update order (address, delivery dates, total amount, etc.)
    public OrderDTO updateOrder(Long id, OrderDTO dto) {
        return orderRepository.findById(id).map(existing -> {
            existing.setShippingAddress(dto.getShippingAddress());
            existing.setBillingAddress(dto.getBillingAddress());
            existing.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
            existing.setActualDeliveryDate(dto.getActualDeliveryDate());
            existing.setTotalAmount(dto.getTotalAmount());
            return orderMapper.orderToOrderDTO(orderRepository.save(existing));
        }).orElse(null);
    }

    // delete order by id
    public boolean deleteOrder(Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // update order status with one method for all statuses
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(status);
            // Handle side effects:
            if (status == OrderStatus.DELIVERED) {
                order.setActualDeliveryDate(LocalDateTime.now());
            }
            return orderMapper.orderToOrderDTO(orderRepository.save(order));
        }).orElse(null);
    }

    // approve, pack, deliver, cancel, return
    public OrderDTO approveOrder(Long orderId) { return updateOrderStatus(orderId, OrderStatus.APPROVED); }
    public OrderDTO markOrderPacking(Long orderId) { return updateOrderStatus(orderId, OrderStatus.PACKING); }
    public OrderDTO markOrderShipped(Long orderId) { return updateOrderStatus(orderId, OrderStatus.SHIPPED); }
    public OrderDTO markOrderDelivered(Long orderId) { return updateOrderStatus(orderId, OrderStatus.DELIVERED); }
    public OrderDTO cancelOrder(Long orderId) { return updateOrderStatus(orderId, OrderStatus.CANCELLED); }
    public OrderDTO markOrderReturned(Long orderId) { return updateOrderStatus(orderId, OrderStatus.RETURNED); }

    // list all orders with a given status
    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == status)
                .map(orderMapper::orderToOrderDTO)
                .collect(Collectors.toList());
    }







}
