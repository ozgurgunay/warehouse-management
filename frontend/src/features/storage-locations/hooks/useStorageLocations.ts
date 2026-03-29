import { useEffect, useMemo, useState } from 'react'

import type { ApiError } from '../../../services/apiClient'
import { getStorageLocations } from '../api'
import type { StorageLocation } from '../types'

type State = {
  data: StorageLocation[] | null
  isLoading: boolean
  error: ApiError | null
  refetch: () => void
}

/**
 * @param warehouseId when set, lists locations for that warehouse only; when null, lists all sites (admin view).
 */
export function useStorageLocations(warehouseId: number | null): State {
  const [data, setData] = useState<StorageLocation[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useMemo(() => () => setReloadKey((x) => x + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    setIsLoading(true)
    setError(null)

    getStorageLocations(warehouseId, controller.signal)
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
