package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.OrderDTO;
import com.example.warehousemanagement.entity.Order;
import com.example.warehousemanagement.entity.OrderItem;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.entity.enums.OrderStatus;
import com.example.warehousemanagement.entity.enums.PaymentStatus;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.OrderMapper;
import com.example.warehousemanagement.mapper.OrderItemMapper;
import com.example.warehousemanagement.repository.CustomerRepository;
import com.example.warehousemanagement.repository.OrderRepository;
import com.example.warehousemanagement.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryAllocationService inventoryAllocationService;


    @Autowired
    public OrderService(OrderRepository orderRepository,
                        OrderMapper orderMapper,
                        OrderItemMapper orderItemMapper,
                        CustomerRepository customerRepository,
                        ProductRepository productRepository,
                        InventoryAllocationService inventoryAllocationService) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.orderItemMapper = orderItemMapper;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.inventoryAllocationService = inventoryAllocationService;
    }

    // create a new order (with items)
    public OrderDTO createOrder(OrderDTO dto) {
        Order order = new Order();

        // Set customer
        order.setCustomer(
                customerRepository.findById(dto.getCustomerId())
                        .orElseThrow(() -> new NotFoundException("Customer not found with id: " + dto.getCustomerId()))
        );

        // Basic fields
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setShipmentStatus(ShipmentStatus.PENDING);
        order.setShippingAddress(dto.getShippingAddress());
        order.setBillingAddress(dto.getBillingAddress());
        order.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        order.setTotalAmount(dto.getTotalAmount());

        // Map items if provided
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            var items = dto.getItems().stream().map(itemDto -> {
                OrderItem item = orderItemMapper.orderItemDTOToOrderItem(itemDto);

                // Attach parent order
                item.setOrder(order);

                // Resolve product reference
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new NotFoundException("Product not found with id: " + itemDto.getProductId()));
                item.setProduct(product);

                // Ensure pricing fields are consistent
                item.setQuantity(itemDto.getQuantity());
                item.setUnitPrice(itemDto.getUnitPrice());
                item.setTotalPrice(itemDto.getTotalPrice());

                return item;
            }).toList();

            order.setItems(items);
        }

        Order saved = orderRepository.save(order);
        return orderMapper.orderToOrderDTO(saved);
    }

    // get all orders
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::orderToOrderDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns paginated orders with optional filtering by status and customerId.
     */
    public List<OrderDTO> getOrders(OrderStatus status, Long customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return switch (determineOrderFilterMode(status, customerId)) {
            case STATUS_AND_CUSTOMER ->
                    orderRepository.findByCustomerIdAndStatus(customerId, status, pageable)
                            .map(orderMapper::orderToOrderDTO)
                            .getContent();
            case STATUS_ONLY ->
                    orderRepository.findByStatus(status, pageable)
                            .map(orderMapper::orderToOrderDTO)
                            .getContent();
            case CUSTOMER_ONLY ->
                    orderRepository.findByCustomerId(customerId, pageable)
                            .map(orderMapper::orderToOrderDTO)
                            .getContent();
            case NONE ->
                    orderRepository.findAll(pageable)
                            .map(orderMapper::orderToOrderDTO)
                            .getContent();
        };
    }

    private OrderFilterMode determineOrderFilterMode(OrderStatus status, Long customerId) {
        boolean hasStatus = status != null;
        boolean hasCustomer = customerId != null;

        if (hasStatus && hasCustomer) {
            return OrderFilterMode.STATUS_AND_CUSTOMER;
        } else if (hasStatus) {
            return OrderFilterMode.STATUS_ONLY;
        } else if (hasCustomer) {
            return OrderFilterMode.CUSTOMER_ONLY;
        } else {
            return OrderFilterMode.NONE;
        }
    }

    private enum OrderFilterMode {
        NONE,
        STATUS_ONLY,
        CUSTOMER_ONLY,
        STATUS_AND_CUSTOMER
    }

    // Get a single order by ID
    public OrderDTO getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(orderMapper::orderToOrderDTO)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + id));
    }

    // get all orders for a specific customer
    public List<OrderDTO> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId)
                .stream().map(orderMapper::orderToOrderDTO)
                .collect(Collectors.toList());
    }

    // Update order (address, delivery dates, total amount, etc.)
    public OrderDTO updateOrder(Long id, OrderDTO dto) {
        return orderRepository.findById(id).map(existing -> {
            existing.setShippingAddress(dto.getShippingAddress());
            existing.setBillingAddress(dto.getBillingAddress());
            existing.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
            existing.setActualDeliveryDate(dto.getActualDeliveryDate());
            existing.setTotalAmount(dto.getTotalAmount());
            return orderMapper.orderToOrderDTO(orderRepository.save(existing));
        }).orElseThrow(() -> new NotFoundException("Order not found with id: " + id));
    }

    // Delete order by id
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new NotFoundException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }

    // Update order status with one method for all statuses
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(status);
            // Handle side effects:
            if (status == OrderStatus.DELIVERED) {
                order.setActualDeliveryDate(LocalDateTime.now());
                // Safety net: consume allocations when an order is explicitly marked as delivered
                inventoryAllocationService.consumeAllocationsForOrder(orderId);
            } else if (status == OrderStatus.CANCELLED) {
                // Release allocations when order is cancelled
                inventoryAllocationService.releaseAllocationsForOrder(orderId, false);
            }
            return orderMapper.orderToOrderDTO(orderRepository.save(order));
        }).orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));
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
