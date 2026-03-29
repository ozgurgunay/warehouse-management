export type CategoryStatus = 'ACTIVE' | 'ARCHIVED'

export type Category = {
  id: number
  name: string
  description: string | null
  status?: CategoryStatus
  productCount?: number
  createdAt?: string | null
  updatedAt?: string | null
}

export type CategoryPayload = {
  name: string
  description: string | null
  status?: CategoryStatus
}
