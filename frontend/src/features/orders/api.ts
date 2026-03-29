import { apiRequest } from '../../services/apiClient'
import type { OrderDto, OrderStatus } from './types'

export type ListOrdersQuery = {
  status?: OrderStatus | '' | null
  customerId?: number | null
  page?: number
  size?: number
}

export async function listOrders(q: ListOrdersQuery, signal?: AbortSignal) {
  return await apiRequest<OrderDto[]>({
    path: '/orders',
    query: {
      status: q.status || undefined,
      customerId: q.customerId ?? undefined,
      page: q.page ?? 0,
      size: q.size ?? 20,
    },
    signal,
  })
}

export async function getOrder(id: number, signal?: AbortSignal) {
  return await apiRequest<OrderDto>({ path: `/orders/${id}`, signal })
}

export async function patchOrderStatus(orderId: number, status: OrderStatus) {
  return await apiRequest<OrderDto>({
    method: 'PATCH',
    path: `/orders/${orderId}/status`,
    query: { status },
  })
}
