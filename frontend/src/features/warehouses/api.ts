import { apiRequest } from '../../services/apiClient'
import type { Warehouse, WarehouseStats, WarehouseWritePayload } from './types'

export async function getWarehouses(signal?: AbortSignal) {
  return await apiRequest<Warehouse[]>({ path: '/warehouses', signal })
}

export async function getWarehouseStats(signal?: AbortSignal) {
  return await apiRequest<WarehouseStats>({ path: '/warehouses/stats', signal })
}

export async function getWarehouseById(
  warehouseId: number,
  signal?: AbortSignal,
) {
  return await apiRequest<Warehouse>({
    path: `/warehouses/${warehouseId}`,
    signal,
  })
}

export async function createWarehouse(
  body: WarehouseWritePayload,
  signal?: AbortSignal,
) {
  return await apiRequest<Warehouse>({
    method: 'POST',
    path: '/warehouses',
    body,
    signal,
  })
}

export async function updateWarehouse(
  warehouseId: number,
  body: WarehouseWritePayload,
  signal?: AbortSignal,
) {
  return await apiRequest<Warehouse>({
    method: 'PUT',
    path: `/warehouses/${warehouseId}`,
    body: {
      id: warehouseId,
      warehouseCode: body.warehouseCode,
      name: body.name,
      location: body.location,
      region: body.region,
      status: body.status,
      maxCapacityM2: body.maxCapacityM2,
      occupiedM2: body.occupiedM2,
      contactNumber: body.contactNumber,
    },
    signal,
  })
}

export async function deleteWarehouse(
  warehouseId: number,
  signal?: AbortSignal,
) {
  await apiRequest<void>({
    method: 'DELETE',
    path: `/warehouses/${warehouseId}`,
    signal,
  })
}
