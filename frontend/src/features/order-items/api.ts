import { apiRequest } from '../../services/apiClient'
import type { OrderItemDto } from '../orders/types'

export async function listOrderItems(signal?: AbortSignal) {
  return await apiRequest<OrderItemDto[]>({ path: '/order-items', signal })
}

export async function getOrderItem(id: number, signal?: AbortSignal) {
  return await apiRequest<OrderItemDto>({ path: `/order-items/${id}`, signal })
}

export type OrderItemCreatePayload = {
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
  batchNo?: string | null
  barcode?: string | null
  qrCode?: string | null
}

export async function createOrderItem(body: OrderItemCreatePayload) {
  return await apiRequest<OrderItemDto>({
    method: 'POST',
    path: '/order-items',
    body,
  })
}

export async function updateOrderItem(id: number, body: OrderItemDto) {
  return await apiRequest<OrderItemDto>({
    method: 'PUT',
    path: `/order-items/${id}`,
    body: { ...body, id },
  })
}

export async function deleteOrderItem(id: number) {
  await apiRequest<void>({
    method: 'DELETE',
    path: `/order-items/${id}`,
  })
}
