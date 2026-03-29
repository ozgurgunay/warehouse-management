import { apiRequest } from '../../services/apiClient'
import type { CustomerDto, CustomerPayload } from './types'

export async function listCustomers(signal?: AbortSignal) {
  return await apiRequest<CustomerDto[]>({ path: '/customers', signal })
}

export async function getCustomer(id: number, signal?: AbortSignal) {
  return await apiRequest<CustomerDto>({ path: `/customers/${id}`, signal })
}

export async function createCustomer(body: CustomerPayload) {
  return await apiRequest<CustomerDto>({
    method: 'POST',
    path: '/customers',
    body,
  })
}

export async function updateCustomer(id: number, body: CustomerPayload) {
  return await apiRequest<CustomerDto>({
    method: 'PUT',
    path: `/customers/${id}`,
    body,
  })
}

export async function deleteCustomer(id: number) {
  await apiRequest<void>({
    method: 'DELETE',
    path: `/customers/${id}`,
  })
}
