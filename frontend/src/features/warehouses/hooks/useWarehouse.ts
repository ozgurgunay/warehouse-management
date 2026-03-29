import { useEffect, useMemo, useState } from 'react'

import type { ApiError } from '../../../services/apiClient'
import { getWarehouseById } from '../api'
import type { Warehouse } from '../types'

type UseWarehouseState = {
  data: Warehouse | null
  isLoading: boolean
  error: ApiError | null
  refetch: () => void
}

export function useWarehouse(
  warehouseId: number | null,
  isValidId: boolean,
): UseWarehouseState {
  const [data, setData] = useState<Warehouse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useMemo(() => () => setReloadKey((x) => x + 1), [])

  useEffect(() => {
    if (!isValidId || warehouseId === null) {
      setData(null)
      setError(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    let isCurrent = true

    setIsLoading(true)
    setError(null)

    getWarehouseById(warehouseId, controller.signal)
      .then((result) => {
        if (!isCurrent) return
        setData(result)
      })
      .catch((err: unknown) => {
        if (!isCurrent) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        setData(null)
        setError(err as ApiError)
      })
      .finally(() => {
        if (!isCurrent) return
        setIsLoading(false)
      })

    return () => {
      isCurrent = false
      controller.abort()
    }
  }, [isValidId, warehouseId, reloadKey])

  return { data, isLoading, error, refetch }
}
