import { apiRequest } from '../../services/apiClient'
import type {
  DeliverShipmentPayload,
  MarkShippedPayload,
  ShipmentDto,
  ShipmentPage,
  ShipmentStatus,
} from './types'

export type ShipmentsQuery = {
  page?: number
  size?: number
  status?: ShipmentStatus | '' | null
  orderId?: number | null
  carrier?: string | null
  tracking?: string | null
  shippedFrom?: string | null
  shippedTo?: string | null
}

export async function getShipmentsPage(q: ShipmentsQuery, signal?: AbortSignal) {
  return await apiRequest<ShipmentPage>({
    path: '/shipments',
    query: {
      page: q.page ?? 0,
      size: q.size ?? 15,
      status: q.status || undefined,
      orderId: q.orderId ?? undefined,
      carrier: q.carrier || undefined,
      tracking: q.tracking || undefined,
      shippedFrom: q.shippedFrom || undefined,
      shippedTo: q.shippedTo || undefined,
    },
    signal,
  })
}

export async function getShipmentById(id: number, signal?: AbortSignal) {
  return await apiRequest<ShipmentDto>({ path: `/shipments/${id}`, signal })
}

export async function createShipment(body: Partial<ShipmentDto> & { orderId: number }, signal?: AbortSignal) {
  return await apiRequest<ShipmentDto>({
    method: 'POST',
    path: '/shipments',
    body,
    signal,
  })
}

export async function updateShipment(id: number, body: Partial<ShipmentDto>, signal?: AbortSignal) {
  return await apiRequest<ShipmentDto>({
    method: 'PUT',
    path: `/shipments/${id}`,
    body,
    signal,
  })
}

export async function patchShipmentStatus(id: number, status: ShipmentStatus, signal?: AbortSignal) {
  return await apiRequest<ShipmentDto>({
    method: 'PATCH',
    path: `/shipments/${id}/status`,
    query: { status },
    signal,
  })
}

export async function markShipmentShipped(id: number, body: MarkShippedPayload, signal?: AbortSignal) {
  return await apiRequest<ShipmentDto>({
    method: 'POST',
    path: `/shipments/${id}/ship`,
    body: {
      carrier: body.carrier,
      trackingNumber: body.trackingNumber ?? null,
      shippedAt: body.shippedAt,
    },
    signal,
  })
}

export async function markShipmentDelivered(id: number, body: DeliverShipmentPayload, signal?: AbortSignal) {
  return await apiRequest<ShipmentDto>({
    method: 'POST',
    path: `/shipments/${id}/deliver`,
    body: {
      receiverName: body.receiverName,
      receiverPhone: body.receiverPhone,
      deliveryNote: body.deliveryNote ?? null,
      deliveredAt: body.deliveredAt,
    },
    signal,
  })
}
