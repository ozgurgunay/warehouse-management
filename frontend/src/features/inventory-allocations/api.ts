import { apiRequest } from '../../services/apiClient'
import type {
  AllocateStockPayload,
  AllocationStatus,
  InventoryAllocationPage,
} from './types'

export type AllocationsQuery = {
  page?: number
  size?: number
  warehouseId?: number | null
  productId?: number | null
  orderId?: number | null
  status?: AllocationStatus | '' | null
  dateFrom?: string | null
  dateTo?: string | null
}

export async function getAllocationsPage(q: AllocationsQuery, signal?: AbortSignal) {
  return await apiRequest<InventoryAllocationPage>({
    path: '/inventory-allocations',
    query: {
      page: q.page ?? 0,
      size: q.size ?? 15,
      warehouseId: q.warehouseId ?? undefined,
      productId: q.productId ?? undefined,
      orderId: q.orderId ?? undefined,
      status: q.status || undefined,
      dateFrom: q.dateFrom || undefined,
      dateTo: q.dateTo || undefined,
    },
    signal,
  })
}

export async function allocateStockForOrder(body: AllocateStockPayload, signal?: AbortSignal) {
  await apiRequest<void>({
    method: 'POST',
    path: '/inventory-allocations',
    body,
    signal,
  })
}
