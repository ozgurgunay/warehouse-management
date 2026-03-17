package com.example.warehousemanagement.controller;

import com.example.warehousemanagement.dto.ShipmentDTO;
import com.example.warehousemanagement.entity.enums.ShipmentStatus;
import com.example.warehousemanagement.entity.enums.ShippingMethod;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.service.ShipmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

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
 * Tests for {@link ShipmentController} REST API.
 * Uses @WebMvcTest to load only the web layer and mock ShipmentService.
 *
 * How to run:
 *   - All tests in this class: mvnw test -Dtest=ShipmentControllerTest
 *   - Single nested class:     mvnw test -Dtest=ShipmentControllerTest$GetShipmentById
 *   - From IDE: right-click class or method -> Run Tests
 *
 * For state-changing requests (POST, PUT, PATCH, DELETE), .with(csrf()) is required
 * so that Spring Security accepts the request (otherwise 403 Forbidden).
 */
@WebMvcTest(ShipmentController.class)
class ShipmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ShipmentService shipmentService;

    // --- GET /shipments/{id} ---

    @Nested
    @DisplayName("GET /shipments/{id}")
    class GetShipmentById {

        @Test
        @DisplayName("returns 200 and shipment when found")
        void getShipmentById_whenFound_returnsOkAndBody() throws Exception {
            Long id = 1L;
            ShipmentDTO dto = new ShipmentDTO();
            dto.setId(id);
            dto.setOrderId(10L);
            dto.setStatus(ShipmentStatus.PENDING.name());
            dto.setShippingAddress("Ankara, Turkey");

            when(shipmentService.getShipmentById(id)).thenReturn(dto);

            mockMvc.perform(get("/shipments/{id}", id)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(id))
                    .andExpect(jsonPath("$.orderId").value(10))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.shippingAddress").value("Ankara, Turkey"));

            verify(shipmentService).getShipmentById(id);
        }

        @Test
        @DisplayName("returns 404 when shipment not found")
        void getShipmentById_whenNotFound_returns404() throws Exception {
            Long id = 999L;
            when(shipmentService.getShipmentById(id))
                    .thenThrow(new NotFoundException("Shipment not found with id: " + id));

            mockMvc.perform(get("/shipments/{id}", id)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isNotFound());

            verify(shipmentService).getShipmentById(id);
        }
    }

    // --- POST /shipments (create) ---
    @Nested
    @DisplayName("POST /shipments")
    class CreateShipment {

        @Test
        @DisplayName("returns 200 and created shipment when request is valid")
        void createShipment_whenValid_returnsOkAndBody() throws Exception {
            ShipmentDTO request = new ShipmentDTO();
            request.setOrderId(5L);
            request.setShippingAddress("Istanbul, Turkey");
            request.setShippingMethod(ShippingMethod.STANDARD_COURIER);

            ShipmentDTO created = new ShipmentDTO();
            created.setId(1L);
            created.setOrderId(5L);
            created.setStatus(ShipmentStatus.PENDING.name());
            created.setShippingAddress("Istanbul, Turkey");
            created.setShippingMethod(ShippingMethod.STANDARD_COURIER);

            when(shipmentService.createShipment(any(ShipmentDTO.class))).thenReturn(created);

            mockMvc.perform(post("/shipments")
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.orderId").value(5))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.shippingAddress").value("Istanbul, Turkey"));

            verify(shipmentService).createShipment(any(ShipmentDTO.class));
        }
    }

    // --- GET /shipments (list with optional filters) ---
    @Nested
    @DisplayName("GET /shipments")
    class GetAllShipments {

        @Test
        @DisplayName("returns 200 and list when no filters")
        void getAllShipments_withNoFilters_returnsOkAndList() throws Exception {
            ShipmentDTO dto = new ShipmentDTO();
            dto.setId(1L);
            dto.setStatus(ShipmentStatus.PENDING.name());
            when(shipmentService.getShipments(eq(null), eq(null), eq(0), eq(20)))
                    .thenReturn(List.of(dto));

            mockMvc.perform(get("/shipments")
                            .with(user("test").roles("USER")))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].status").value("PENDING"));

            verify(shipmentService).getShipments(null, null, 0, 20);
        }

        @Test
        @DisplayName("returns 200 and list when status and orderId provided")
        void getAllShipments_withStatusAndOrderId_returnsOkAndList() throws Exception {
            when(shipmentService.getShipments(eq(ShipmentStatus.PENDING), eq(10L), eq(0), eq(10)))
                    .thenReturn(List.of());

            mockMvc.perform(get("/shipments")
                            .with(user("test").roles("USER"))
                            .param("status", "PENDING")
                            .param("orderId", "10")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));

            verify(shipmentService).getShipments(ShipmentStatus.PENDING, 10L, 0, 10);
        }
    }

    // --- PUT /shipments/{id} (update) ---
    @Nested
    @DisplayName("PUT /shipments/{id}")
    class UpdateShipment {

        @Test
        @DisplayName("returns 200 and updated shipment when found")
        void updateShipment_whenFound_returnsOkAndBody() throws Exception {
            Long id = 1L;
            ShipmentDTO request = new ShipmentDTO();
            request.setShippingAddress("Izmir, Turkey");
            request.setShipmentCost(25.0);

            ShipmentDTO updated = new ShipmentDTO();
            updated.setId(id);
            updated.setShippingAddress("Izmir, Turkey");
            updated.setShipmentCost(25.0);

            when(shipmentService.updateShipment(eq(id), any(ShipmentDTO.class))).thenReturn(updated);

            mockMvc.perform(put("/shipments/{id}", id)
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(id))
                    .andExpect(jsonPath("$.shippingAddress").value("Izmir, Turkey"))
                    .andExpect(jsonPath("$.shipmentCost").value(25.0));

            verify(shipmentService).updateShipment(eq(id), any(ShipmentDTO.class));
        }

        @Test
        @DisplayName("returns 404 when shipment not found")
        void updateShipment_whenNotFound_returns404() throws Exception {
            Long id = 999L;
            ShipmentDTO request = new ShipmentDTO();
            request.setShippingAddress("Ankara");
            when(shipmentService.updateShipment(eq(id), any(ShipmentDTO.class)))
                    .thenThrow(new NotFoundException("Shipment not found with id: " + id));

            mockMvc.perform(put("/shipments/{id}", id)
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());

            verify(shipmentService).updateShipment(eq(id), any(ShipmentDTO.class));
        }
    }

    // --- DELETE /shipments/{id} ---
    @Nested
    @DisplayName("DELETE /shipments/{id}")
    class DeleteShipment {

        @Test
        @DisplayName("returns 204 when shipment exists")
        void deleteShipment_whenExists_returnsNoContent() throws Exception {
            Long id = 1L;
            mockMvc.perform(delete("/shipments/{id}", id)
                            .with(user("test").roles("USER"))
                            .with(csrf()))
                    .andExpect(status().isNoContent());

            verify(shipmentService).deleteShipment(id);
        }

        @Test
        @DisplayName("returns 404 when shipment not found")
        void deleteShipment_whenNotFound_returns404() throws Exception {
            Long id = 999L;
            doThrow(new NotFoundException("Shipment not found with id: " + id))
                    .when(shipmentService).deleteShipment(id);

            mockMvc.perform(delete("/shipments/{id}", id)
                            .with(user("test").roles("USER"))
                            .with(csrf()))
                    .andExpect(status().isNotFound());

            verify(shipmentService).deleteShipment(id);
        }
    }

    // --- PATCH /shipments/{id}/status ---
    @Nested
    @DisplayName("PATCH /shipments/{id}/status")
    class UpdateShipmentStatus {

        @Test
        @DisplayName("returns 200 and updated shipment when found")
        void updateStatus_whenFound_returnsOkAndBody() throws Exception {
            Long id = 1L;
            ShipmentStatus newStatus = ShipmentStatus.IN_TRANSIT;
            ShipmentDTO updated = new ShipmentDTO();
            updated.setId(id);
            updated.setStatus(newStatus.name());

            when(shipmentService.updateShipmentStatus(id, newStatus)).thenReturn(updated);

            mockMvc.perform(patch("/shipments/{id}/status", id)
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .param("status", "IN_TRANSIT"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(id))
                    .andExpect(jsonPath("$.status").value("IN_TRANSIT"));

            verify(shipmentService).updateShipmentStatus(id, newStatus);
        }

        @Test
        @DisplayName("returns 404 when shipment not found")
        void updateStatus_whenNotFound_returns404() throws Exception {
            Long id = 999L;
            when(shipmentService.updateShipmentStatus(id, ShipmentStatus.DELIVERED))
                    .thenThrow(new NotFoundException("Shipment not found with id: " + id));

            mockMvc.perform(patch("/shipments/{id}/status", id)
                            .with(user("test").roles("USER"))
                            .with(csrf())
                            .param("status", "DELIVERED"))
                    .andExpect(status().isNotFound());

            verify(shipmentService).updateShipmentStatus(id, ShipmentStatus.DELIVERED);
        }
    }

    // --- GET /shipments/by-order/{orderId} ---
    @Nested
    @DisplayName("GET /shipments/by-order/{orderId}")
    class GetShipmentsByOrderId {

        @Test
        @DisplayName("returns 200 and list of shipments for order")
        void getByOrderId_returnsOkAndList() throws Exception {
            Long orderId = 10L;
            ShipmentDTO dto = new ShipmentDTO();
            dto.setId(1L);
            dto.setOrderId(orderId);
            when(shipmentService.getShipmentsByOrderId(orderId)).thenReturn(List.of(dto));

            mockMvc.perform(get("/shipments/by-order/{orderId}", orderId)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].orderId").value(10));

            verify(shipmentService).getShipmentsByOrderId(orderId);
        }
    }

    // --- GET /shipments/by-barcode/{barcode} ---
    @Nested
    @DisplayName("GET /shipments/by-barcode/{barcode}")
    class GetShipmentByBarcode {

        @Test
        @DisplayName("returns 200 and shipment when barcode found")
        void getByBarcode_whenFound_returnsOkAndBody() throws Exception {
            String barcode = "BAR123";
            ShipmentDTO dto = new ShipmentDTO();
            dto.setId(1L);
            dto.setBarcode(barcode);
            when(shipmentService.findByBarcode(barcode)).thenReturn(dto);

            mockMvc.perform(get("/shipments/by-barcode/{barcode}", barcode)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.barcode").value(barcode));

            verify(shipmentService).findByBarcode(barcode);
        }

        @Test
        @DisplayName("returns 404 when barcode not found")
        void getByBarcode_whenNotFound_returns404() throws Exception {
            String barcode = "UNKNOWN";
            when(shipmentService.findByBarcode(barcode))
                    .thenThrow(new NotFoundException("Shipment not found with barcode: " + barcode));

            mockMvc.perform(get("/shipments/by-barcode/{barcode}", barcode)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isNotFound());

            verify(shipmentService).findByBarcode(barcode);
        }
    }

    // --- GET /shipments/by-qrcode/{qrcode} ---
    @Nested
    @DisplayName("GET /shipments/by-qrcode/{qrcode}")
    class GetShipmentByQrCode {

        @Test
        @DisplayName("returns 200 and shipment when qrcode found")
        void getByQrCode_whenFound_returnsOkAndBody() throws Exception {
            String qrCode = "QR456";
            ShipmentDTO dto = new ShipmentDTO();
            dto.setId(2L);
            dto.setQrCode(qrCode);
            when(shipmentService.findByQrCode(qrCode)).thenReturn(dto);

            mockMvc.perform(get("/shipments/by-qrcode/{qrcode}", qrCode)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(2))
                    .andExpect(jsonPath("$.qrCode").value(qrCode));

            verify(shipmentService).findByQrCode(qrCode);
        }

        @Test
        @DisplayName("returns 404 when qrcode not found")
        void getByQrCode_whenNotFound_returns404() throws Exception {
            String qrCode = "UNKNOWN_QR";
            when(shipmentService.findByQrCode(qrCode))
                    .thenThrow(new NotFoundException("Shipment not found with QR code: " + qrCode));

            mockMvc.perform(get("/shipments/by-qrcode/{qrcode}", qrCode)
                            .with(user("test").roles("USER")))
                    .andExpect(status().isNotFound());

            verify(shipmentService).findByQrCode(qrCode);
        }
    }
}
