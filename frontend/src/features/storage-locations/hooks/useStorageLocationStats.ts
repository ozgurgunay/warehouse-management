import { useEffect, useMemo, useState } from 'react'

import type { ApiError } from '../../../services/apiClient'
import { getStorageLocationStats } from '../api'
import type { StorageLocationStats } from '../types'

type State = {
  data: StorageLocationStats | null
  isLoading: boolean
  error: ApiError | null
  refetch: () => void
}

/**
 * @param warehouseId when set, KPIs are scoped to that warehouse; when null, global totals.
 */
export function useStorageLocationStats(warehouseId: number | null): State {
  const [data, setData] = useState<StorageLocationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useMemo(() => () => setReloadKey((x) => x + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    setIsLoading(true)
    setError(null)

    getStorageLocationStats(warehouseId, controller.signal)
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
  }, [reloadKey, warehouseId])

  return { data, isLoading, error, refetch }
}
