import { apiRequest } from '../../services/apiClient'
import type { Category, CategoryPayload } from './types'

export async function getCategories(signal?: AbortSignal) {
  return await apiRequest<Category[]>({ path: '/categories', signal })
}

export async function getCategoryById(id: number, signal?: AbortSignal) {
  return await apiRequest<Category>({ path: `/categories/${id}`, signal })
}

export async function createCategory(body: CategoryPayload) {
  return await apiRequest<Category>({
    method: 'POST',
    path: '/categories',
    body,
  })
}

export async function updateCategory(id: number, body: CategoryPayload) {
  return await apiRequest<Category>({
    method: 'PUT',
    path: `/categories/${id}`,
    body,
  })
}

export async function deleteCategory(id: number) {
  await apiRequest<void>({
    method: 'DELETE',
    path: `/categories/${id}`,
  })
}
