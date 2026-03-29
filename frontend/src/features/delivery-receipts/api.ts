import { apiRequest } from '../../services/apiClient'
import type { DeliveryReceiptDto, DeliveryReceiptUpsertPayload } from './types'

export async function listDeliveryReceipts(signal?: AbortSignal) {
  return await apiRequest<DeliveryReceiptDto[]>({
    path: '/delivery-receipts',
    signal,
  })
}

export async function getDeliveryReceiptById(id: number, signal?: AbortSignal) {
  return await apiRequest<DeliveryReceiptDto>({
    path: `/delivery-receipts/${id}`,
    signal,
  })
}

export async function getDeliveryReceiptByShipmentId(shipmentId: number, signal?: AbortSignal) {
  return await apiRequest<DeliveryReceiptDto>({
    path: `/delivery-receipts/by-shipment/${shipmentId}`,
    signal,
  })
}

export async function createDeliveryReceipt(body: DeliveryReceiptUpsertPayload, signal?: AbortSignal) {
  return await apiRequest<DeliveryReceiptDto>({
    method: 'POST',
    path: '/delivery-receipts',
    body,
    signal,
  })
}

export async function updateDeliveryReceipt(id: number, body: DeliveryReceiptUpsertPayload, signal?: AbortSignal) {
  return await apiRequest<DeliveryReceiptDto>({
    method: 'PUT',
    path: `/delivery-receipts/${id}`,
    body,
    signal,
  })
}

export async function deleteDeliveryReceipt(id: number, signal?: AbortSignal) {
  return await apiRequest<void>({
    method: 'DELETE',
    path: `/delivery-receipts/${id}`,
    signal,
  })
}
