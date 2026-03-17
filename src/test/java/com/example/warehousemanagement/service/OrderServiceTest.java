package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.OrderDTO;
import com.example.warehousemanagement.dto.OrderItemDTO;
import com.example.warehousemanagement.entity.Order;
import com.example.warehousemanagement.entity.OrderItem;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.entity.enums.OrderStatus;
import com.example.warehousemanagement.entity.enums.PaymentStatus;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.OrderItemMapper;
import com.example.warehousemanagement.mapper.OrderMapper;
import com.example.warehousemanagement.repository.CustomerRepository;
import com.example.warehousemanagement.repository.OrderRepository;
import com.example.warehousemanagement.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pure unit tests for {@link OrderService}.
 *
 * Type: service layer unit tests.
 * - No Spring context is started.
 * - All dependencies are Mockito mocks.
 * - Only business logic inside OrderService is tested.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderItemMapper orderItemMapper;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryAllocationService inventoryAllocationService;

    @InjectMocks
    private OrderService orderService;

    // --- createOrder ---

    @Nested
    @DisplayName("createOrder")
    class CreateOrder {

        @Test
        @DisplayName("throws NotFoundException when customer does not exist")
        void createOrder_whenCustomerNotFound_throwsNotFound() {
            OrderDTO dto = new OrderDTO();
            dto.setCustomerId(99L);

            when(customerRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.createOrder(dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Customer not found with id: 99");

            verify(customerRepository).findById(99L);
            verifyNoInteractions(orderRepository, orderMapper, orderItemMapper, productRepository, inventoryAllocationService);
        }

        @Test
        @DisplayName("throws NotFoundException when any product in items does not exist")
        void createOrder_whenProductNotFound_throwsNotFound() {
            OrderDTO dto = new OrderDTO();
            dto.setCustomerId(1L);

            OrderItemDTO itemDto = new OrderItemDTO();
            itemDto.setProductId(10L);
            itemDto.setQuantity(2);
            itemDto.setUnitPrice(5.0);
            itemDto.setTotalPrice(10.0);
            dto.setItems(List.of(itemDto));

            when(customerRepository.findById(1L)).thenReturn(Optional.of(new com.example.warehousemanagement.entity.Customer()));
            when(orderItemMapper.orderItemDTOToOrderItem(itemDto)).thenReturn(new OrderItem());
            when(productRepository.findById(10L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.createOrder(dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Product not found with id: 10");

            verify(customerRepository).findById(1L);
            verify(productRepository).findById(10L);
            verify(orderRepository, never()).save(any(Order.class));
        }
    }

    // --- getOrders (filter + paging) ---

    @Nested
    @DisplayName("getOrders")
    class GetOrders {

        @Test
        @DisplayName("returns paged orders when no filters")
        void getOrders_whenNoFilters_returnsPagedList() {
            Order order = new Order();
            order.setId(1L);
            order.setStatus(OrderStatus.PENDING);

            OrderDTO dto = new OrderDTO();
            dto.setId(1L);
            dto.setStatus(OrderStatus.PENDING.name());

            Page<Order> page = new PageImpl<>(List.of(order));

            when(orderRepository.findAll(PageRequest.of(0, 20))).thenReturn(page);
            when(orderMapper.orderToOrderDTO(order)).thenReturn(dto);

            List<OrderDTO> result = orderService.getOrders(null, null, 0, 20);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            assertThat(result.get(0).getStatus()).isEqualTo("PENDING");

            verify(orderRepository).findAll(PageRequest.of(0, 20));
            verify(orderMapper).orderToOrderDTO(order);
        }

        @Test
        @DisplayName("filters by status and customer when both are provided")
        void getOrders_whenStatusAndCustomerFilters_returnsFilteredPage() {
            OrderStatus status = OrderStatus.APPROVED;
            Long customerId = 5L;

            Order order = new Order();
            order.setId(2L);
            order.setStatus(status);

            OrderDTO dto = new OrderDTO();
            dto.setId(2L);
            dto.setStatus(status.name());

            Page<Order> page = new PageImpl<>(List.of(order));

            when(orderRepository.findByCustomerIdAndStatus(eq(customerId), eq(status), any(PageRequest.class)))
                    .thenReturn(page);
            when(orderMapper.orderToOrderDTO(order)).thenReturn(dto);

            List<OrderDTO> result = orderService.getOrders(status, customerId, 1, 10);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(2L);
            assertThat(result.get(0).getStatus()).isEqualTo("APPROVED");

            verify(orderRepository).findByCustomerIdAndStatus(eq(customerId), eq(status), any(PageRequest.class));
        }
    }

    // --- updateOrderStatus ---

    @Nested
    @DisplayName("updateOrderStatus")
    class UpdateOrderStatus {

        @Test
        @DisplayName("sets status to DELIVERED, actualDeliveryDate and consumes allocations")
        void updateOrderStatus_toDelivered_setsFieldsAndConsumesAllocations() {
            Long orderId = 1L;
            Order order = new Order();
            order.setId(orderId);
            order.setStatus(OrderStatus.PENDING);

            OrderDTO dto = new OrderDTO();
            dto.setId(orderId);
            dto.setStatus(OrderStatus.DELIVERED.name());

            when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
            when(orderRepository.save(order)).thenReturn(order);
            when(orderMapper.orderToOrderDTO(order)).thenReturn(dto);

            OrderDTO result = orderService.updateOrderStatus(orderId, OrderStatus.DELIVERED);

            assertThat(result.getStatus()).isEqualTo("DELIVERED");
            assertThat(order.getStatus()).isEqualTo(OrderStatus.DELIVERED);
            assertThat(order.getActualDeliveryDate()).isNotNull();

            verify(inventoryAllocationService).consumeAllocationsForOrder(orderId);
            verify(orderRepository).save(order);
        }

        @Test
        @DisplayName("sets status to CANCELLED and releases allocations")
        void updateOrderStatus_toCancelled_releasesAllocations() {
            Long orderId = 2L;
            Order order = new Order();
            order.setId(orderId);
            order.setStatus(OrderStatus.PENDING);

            OrderDTO dto = new OrderDTO();
            dto.setId(orderId);
            dto.setStatus(OrderStatus.CANCELLED.name());

            when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
            when(orderRepository.save(order)).thenReturn(order);
            when(orderMapper.orderToOrderDTO(order)).thenReturn(dto);

            OrderDTO result = orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);

            assertThat(result.getStatus()).isEqualTo("CANCELLED");
            assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);

            verify(inventoryAllocationService).releaseAllocationsForOrder(orderId, false);
            verify(orderRepository).save(order);
        }

        @Test
        @DisplayName("throws NotFoundException when order does not exist")
        void updateOrderStatus_whenOrderNotFound_throwsNotFound() {
            Long orderId = 999L;
            when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.updateOrderStatus(orderId, OrderStatus.DELIVERED))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Order not found with id: 999");
        }
    }

    // --- deleteOrder ---

    @Nested
    @DisplayName("deleteOrder")
    class DeleteOrder {

        @Test
        @DisplayName("deletes when order exists")
        void deleteOrder_whenExists_deletes() {
            Long orderId = 1L;
            when(orderRepository.existsById(orderId)).thenReturn(true);

            orderService.deleteOrder(orderId);

            verify(orderRepository).existsById(orderId);
            verify(orderRepository).deleteById(orderId);
        }

        @Test
        @DisplayName("throws NotFoundException when order does not exist")
        void deleteOrder_whenNotExists_throwsNotFound() {
            Long orderId = 999L;
            when(orderRepository.existsById(orderId)).thenReturn(false);

            assertThatThrownBy(() -> orderService.deleteOrder(orderId))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Order not found with id: 999");

            verify(orderRepository).existsById(orderId);
            verify(orderRepository, never()).deleteById(anyLong());
        }
    }
}

