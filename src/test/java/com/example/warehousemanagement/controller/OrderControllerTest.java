package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.OrderDTO;
import com.example.warehousemanagement.entity.enums.OrderStatus;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for {@link OrderController} REST API.
 *
 * Type: Web layer tests (@WebMvcTest) using MockMvc.
 * - We mock OrderService (no real DB or business logic).
 * - We verify HTTP status codes, JSON structure and security (auth + CSRF).
 *
 * How to run:
 *   - All tests in this class: mvnw test -Dtest=OrderControllerTest
 *   - Run from IDE: right-click class or method -> Run Tests
 */
@WebMvcTest(OrderController.class)
@Import(OrderControllerTest.OrderControllerTestConfig.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderService orderService;

    @TestConfiguration
    static class OrderControllerTestConfig {

        @Bean
        OrderService orderService() {
            return org.mockito.Mockito.mock(OrderService.class);
        }
    }

    // --- GET /orders/{id} ---

    @Nested
    @DisplayName("GET /orders/{id}")
    class GetOrderById {

        @Test
        @DisplayName("returns 200 and order when found")
        void getOrderById_whenFound_returnsOkAndBody() throws Exception {
            Long id = 1L;
            OrderDTO dto = new OrderDTO();
            dto.setId(id);
            dto.setCustomerId(5L);
            dto.setStatus(OrderStatus.PENDING.name());
            dto.setShippingAddress("Ankara, Turkey");

            when(orderService.getOrderById(id)).thenReturn(dto);

            mockMvc.perform(get("/orders/{id}", id)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(id))
                    .andExpect(jsonPath("$.customerId").value(5))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.shippingAddress").value("Ankara, Turkey"));

            verify(orderService).getOrderById(id);
        }

        @Test
        @DisplayName("returns 404 when order not found")
        void getOrderById_whenNotFound_returns404() throws Exception {
            Long id = 999L;
            when(orderService.getOrderById(id))
                    .thenThrow(new NotFoundException("Order not found with id: " + id));

            mockMvc.perform(get("/orders/{id}", id)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isNotFound());

            verify(orderService).getOrderById(id);
        }
    }

    // --- POST /orders (create) ---

    @Nested
    @DisplayName("POST /orders")
    class CreateOrder {

        @Test
        @DisplayName("returns 201 and created order when request is valid")
        void createOrder_whenValid_returnsCreatedAndBody() throws Exception {
            OrderDTO request = new OrderDTO();
            request.setCustomerId(5L);
            request.setShippingAddress("Istanbul, Turkey");
            request.setBillingAddress("Istanbul, Turkey");
            request.setTotalAmount(100.0);

            OrderDTO created = new OrderDTO();
            created.setId(1L);
            created.setCustomerId(5L);
            created.setStatus(OrderStatus.PENDING.name());
            created.setShippingAddress("Istanbul, Turkey");
            created.setBillingAddress("Istanbul, Turkey");
            created.setTotalAmount(100.0);

            when(orderService.createOrder(any(OrderDTO.class))).thenReturn(created);

            mockMvc.perform(post("/orders")
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.customerId").value(5))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.totalAmount").value(100.0));

            verify(orderService).createOrder(any(OrderDTO.class));
        }
    }

    // --- GET /orders (list with optional filters) ---

    @Nested
    @DisplayName("GET /orders")
    class GetAllOrders {

        @Test
        @DisplayName("returns 200 and list when no filters")
        void getAllOrders_withNoFilters_returnsOkAndList() throws Exception {
            OrderDTO dto = new OrderDTO();
            dto.setId(1L);
            dto.setStatus(OrderStatus.PENDING.name());

            when(orderService.getOrders(eq(null), eq(null), eq(0), eq(20)))
                    .thenReturn(List.of(dto));

            mockMvc.perform(get("/orders")
                            .with(user("test").roles("USER")))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].status").value("PENDING"));

            verify(orderService).getOrders(null, null, 0, 20);
        }

        @Test
        @DisplayName("returns 200 and list when status and customerId provided")
        void getAllOrders_withStatusAndCustomerId_returnsOkAndList() throws Exception {
            when(orderService.getOrders(eq(OrderStatus.PENDING), eq(10L), eq(1), eq(10)))
                    .thenReturn(List.of());

            mockMvc.perform(get("/orders")
                            .with(user("test").roles("USER"))
                            .param("status", "PENDING")
                            .param("customerId", "10")
                            .param("page", "1")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));

            verify(orderService).getOrders(OrderStatus.PENDING, 10L, 1, 10);
        }
    }

    // --- PUT /orders/{id} (update) ---

    @Nested
    @DisplayName("PUT /orders/{id}")
    class UpdateOrder {

        @Test
        @DisplayName("returns 200 and updated order when found")
        void updateOrder_whenFound_returnsOkAndBody() throws Exception {
            Long id = 1L;
            OrderDTO request = new OrderDTO();
            request.setShippingAddress("Izmir, Turkey");
            request.setBillingAddress("Izmir, Turkey");
            request.setTotalAmount(150.0);

            OrderDTO updated = new OrderDTO();
            updated.setId(id);
            updated.setShippingAddress("Izmir, Turkey");
            updated.setBillingAddress("Izmir, Turkey");
            updated.setTotalAmount(150.0);

            when(orderService.updateOrder(eq(id), any(OrderDTO.class))).thenReturn(updated);

            mockMvc.perform(put("/orders/{id}", id)
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(id))
                    .andExpect(jsonPath("$.shippingAddress").value("Izmir, Turkey"))
                    .andExpect(jsonPath("$.billingAddress").value("Izmir, Turkey"))
                    .andExpect(jsonPath("$.totalAmount").value(150.0));

            verify(orderService).updateOrder(eq(id), any(OrderDTO.class));
        }

        @Test
        @DisplayName("returns 404 when order not found")
        void updateOrder_whenNotFound_returns404() throws Exception {
            Long id = 999L;
            OrderDTO request = new OrderDTO();
            request.setShippingAddress("Ankara");

            when(orderService.updateOrder(eq(id), any(OrderDTO.class)))
                    .thenThrow(new NotFoundException("Order not found with id: " + id));

            mockMvc.perform(put("/orders/{id}", id)
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());

            verify(orderService).updateOrder(eq(id), any(OrderDTO.class));
        }
    }

    // --- DELETE /orders/{id} ---

    @Nested
    @DisplayName("DELETE /orders/{id}")
    class DeleteOrder {

        @Test
        @DisplayName("returns 204 when order exists")
        void deleteOrder_whenExists_returnsNoContent() throws Exception {
            Long id = 1L;

            mockMvc.perform(delete("/orders/{id}", id)
                            .with(user("test").roles("USER"))
                            .with(csrf()))
                    .andExpect(status().isNoContent());

            verify(orderService).deleteOrder(id);
        }

        @Test
        @DisplayName("returns 404 when order not found")
        void deleteOrder_whenNotFound_returns404() throws Exception {
            Long id = 999L;
            doThrow(new NotFoundException("Order not found with id: " + id))
                    .when(orderService).deleteOrder(id);

            mockMvc.perform(delete("/orders/{id}", id)
                            .with(user("test").roles("USER"))
                            .with(csrf()))
                    .andExpect(status().isNotFound());

            verify(orderService).deleteOrder(id);
        }
    }

    // --- PATCH /orders/{id}/status ---

    @Nested
    @DisplayName("PATCH /orders/{id}/status")
    class UpdateOrderStatus {

        @Test
        @DisplayName("returns 200 and updated order when found")
        void updateStatus_whenFound_returnsOkAndBody() throws Exception {
            Long id = 1L;
            OrderStatus newStatus = OrderStatus.APPROVED;
            OrderDTO updated = new OrderDTO();
            updated.setId(id);
            updated.setStatus(newStatus.name());
            updated.setActualDeliveryDate(null);

            when(orderService.updateOrderStatus(id, newStatus)).thenReturn(updated);

            mockMvc.perform(patch("/orders/{id}/status", id)
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .param("status", "APPROVED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(id))
                    .andExpect(jsonPath("$.status").value("APPROVED"));

            verify(orderService).updateOrderStatus(id, newStatus);
        }

        @Test
        @DisplayName("returns 404 when order not found")
        void updateStatus_whenNotFound_returns404() throws Exception {
            Long id = 999L;
            when(orderService.updateOrderStatus(id, OrderStatus.CANCELLED))
                    .thenThrow(new NotFoundException("Order not found with id: " + id));

            mockMvc.perform(patch("/orders/{id}/status", id)
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .param("status", "CANCELLED"))
                    .andExpect(status().isNotFound());

            verify(orderService).updateOrderStatus(id, OrderStatus.CANCELLED);
        }
    }

    // --- GET /orders/by-customer/{customerId} ---

    @Nested
    @DisplayName("GET /orders/by-customer/{customerId}")
    class GetOrdersByCustomerId {

        @Test
        @DisplayName("returns 200 and list of orders for customer")
        void getByCustomerId_returnsOkAndList() throws Exception {
            Long customerId = 10L;
            OrderDTO dto = new OrderDTO();
            dto.setId(1L);
            dto.setCustomerId(customerId);

            when(orderService.getOrdersByCustomerId(customerId)).thenReturn(List.of(dto));

            mockMvc.perform(get("/orders/by-customer/{customerId}", customerId)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].customerId").value(10));

            verify(orderService).getOrdersByCustomerId(customerId);
        }
    }
}