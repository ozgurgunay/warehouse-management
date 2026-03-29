import { useEffect, useMemo, useState } from 'react'

import type { ApiError } from '../../../services/apiClient'
import { getWarehouseStats } from '../api'
import type { WarehouseStats } from '../types'

type UseWarehouseStatsState = {
  data: WarehouseStats | null
  isLoading: boolean
  error: ApiError | null
  refetch: () => void
}

export function useWarehouseStats(): UseWarehouseStatsState {
  const [data, setData] = useState<WarehouseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useMemo(() => () => setReloadKey((x) => x + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    setIsLoading(true)
    setError(null)

    getWarehouseStats(controller.signal)
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
  }, [reloadKey])

  return { data, isLoading, error, refetch }
}
