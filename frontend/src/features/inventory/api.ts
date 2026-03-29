import { apiRequest } from '../../services/apiClient'
import type { InventoryLine, InventoryStatus } from './types'

export type InventoryListQuery = {
  page?: number
  size?: number
  productId?: number | null
  warehouseId?: number | null
  status?: InventoryStatus | null
}

export async function getInventoryLines(q: InventoryListQuery, signal?: AbortSignal) {
  return await apiRequest<InventoryLine[]>({
    path: '/inventory',
    query: {
      page: q.page ?? 0,
      size: q.size ?? 500,
      productId: q.productId ?? undefined,
      warehouseId: q.warehouseId ?? undefined,
      status: q.status ?? undefined,
    },
    signal,
  })
}
