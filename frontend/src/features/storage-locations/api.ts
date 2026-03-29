import { apiRequest } from '../../services/apiClient'
import type {
  StorageLocation,
  StorageLocationStats,
  StorageLocationWritePayload,
} from './types'

function warehouseQuery(warehouseId: number | null | undefined) {
  if (warehouseId == null) return ''
  const q = new URLSearchParams()
  q.set('warehouseId', String(warehouseId))
  return `?${q.toString()}`
}

export async function getStorageLocations(
  warehouseId: number | null,
  signal?: AbortSignal,
) {
  return await apiRequest<StorageLocation[]>({
    path: `/storage-locations${warehouseQuery(warehouseId)}`,
    signal,
  })
}

export async function getStorageLocationStats(
  warehouseId: number | null,
  signal?: AbortSignal,
) {
  return await apiRequest<StorageLocationStats>({
    path: `/storage-locations/stats${warehouseQuery(warehouseId)}`,
    signal,
  })
}

export async function getStorageLocationById(id: number, signal?: AbortSignal) {
  return await apiRequest<StorageLocation>({
    path: `/storage-locations/${id}`,
    signal,
  })
}

export async function createStorageLocation(
  body: StorageLocationWritePayload,
  signal?: AbortSignal,
) {
  return await apiRequest<StorageLocation>({
    method: 'POST',
    path: '/storage-locations',
    body,
    signal,
  })
}

export async function updateStorageLocation(
  id: number,
  body: StorageLocationWritePayload,
  signal?: AbortSignal,
) {
  return await apiRequest<StorageLocation>({
    method: 'PUT',
    path: `/storage-locations/${id}`,
    body: {
      id,
      warehouseId: body.warehouseId,
      locationCode: body.locationCode,
      name: body.name,
      building: body.building,
      floor: body.floor,
      section: body.section,
      zoneLabel: body.zoneLabel,
    },
    signal,
  })
}

export async function deleteStorageLocation(id: number, signal?: AbortSignal) {
  await apiRequest<void>({
    method: 'DELETE',
    path: `/storage-locations/${id}`,
    signal,
  })
}
