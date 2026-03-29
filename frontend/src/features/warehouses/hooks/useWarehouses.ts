import { useEffect, useMemo, useState } from 'react'

import type { ApiError } from '../../../services/apiClient'
import { getWarehouses } from '../api'
import type { Warehouse } from '../types'

type UseWarehousesState = {
  data: Warehouse[] | null
  isLoading: boolean
  error: ApiError | null
  refetch: () => void
}

export function useWarehouses(): UseWarehousesState {
  const [data, setData] = useState<Warehouse[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useMemo(() => () => setReloadKey((x) => x + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    setIsLoading(true)
    setError(null)

    getWarehouses(controller.signal)
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

