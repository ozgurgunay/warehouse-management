import { apiRequest } from '../../services/apiClient'
import type { ProductCatalogPage, ProductDetail, ProductDto, ProductStats } from './types'

/** Full product list (master data); use for compact selects (e.g. stock movement form). */
export async function listProducts(signal?: AbortSignal) {
  return await apiRequest<ProductDto[]>({ path: '/products', signal })
}

export type CatalogQuery = {
  page?: number
  size?: number
  search?: string
  warehouseId?: number | null
  categoryId?: number | null
  stockStatus?: string | null
  updatedFrom?: string | null
  updatedTo?: string | null
}

export async function getProductStats(signal?: AbortSignal) {
  return await apiRequest<ProductStats>({ path: '/products/stats', signal })
}

export async function getProductCatalog(q: CatalogQuery, signal?: AbortSignal) {
  return await apiRequest<ProductCatalogPage>({
    path: '/products/catalog',
    query: {
      page: q.page ?? 0,
      size: q.size ?? 25,
      search: q.search || undefined,
      warehouseId: q.warehouseId ?? undefined,
      categoryId: q.categoryId ?? undefined,
      stockStatus: q.stockStatus || undefined,
      updatedFrom: q.updatedFrom || undefined,
      updatedTo: q.updatedTo || undefined,
    },
    signal,
  })
}

export async function getProductDetail(productId: number, signal?: AbortSignal) {
  return await apiRequest<ProductDetail>({
    path: `/products/${productId}/detail`,
    signal,
  })
}

export async function getProductById(productId: number, signal?: AbortSignal) {
  return await apiRequest<ProductDto>({
    path: `/products/${productId}`,
    signal,
  })
}

export async function createProduct(body: ProductDto, signal?: AbortSignal) {
  return await apiRequest<ProductDto>({
    method: 'POST',
    path: '/products',
    body,
    signal,
  })
}

export async function updateProduct(productId: number, body: ProductDto, signal?: AbortSignal) {
  return await apiRequest<ProductDto>({
    method: 'PUT',
    path: `/products/${productId}`,
    body: { ...body, id: productId },
    signal,
  })
}

export async function deleteProduct(productId: number, signal?: AbortSignal) {
  await apiRequest<void>({
    method: 'DELETE',
    path: `/products/${productId}`,
    signal,
  })
}
