import { apiRequest } from '../../services/apiClient'
import type {
  CreateStockMovementPayload,
  MovementType,
  StockMovementDto,
  StockMovementPage,
} from './types'

export type StockMovementsQuery = {
  page?: number
  size?: number
  warehouseId?: number | null
  productId?: number | null
  movementType?: MovementType | '' | null
  dateFrom?: string | null
  dateTo?: string | null
}

export async function getStockMovementsPage(q: StockMovementsQuery, signal?: AbortSignal) {
  return await apiRequest<StockMovementPage>({
    path: '/stock-movements',
    query: {
      page: q.page ?? 0,
      size: q.size ?? 15,
      warehouseId: q.warehouseId ?? undefined,
      productId: q.productId ?? undefined,
      movementType: q.movementType || undefined,
      dateFrom: q.dateFrom || undefined,
      dateTo: q.dateTo || undefined,
    },
    signal,
  })
}

export async function createStockMovement(body: CreateStockMovementPayload, signal?: AbortSignal) {
  return await apiRequest<StockMovementDto>({
    method: 'POST',
    path: '/stock-movements',
    body,
    signal,
  })
}
