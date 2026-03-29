import { useEffect, useState } from 'react'

import type { ApiError } from '../../../services/apiClient'
import { getRoles } from '../api'
import type { Role } from '../types'

export function useAdminRoles() {
  const [data, setData] = useState<Role[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    setIsLoading(true)
    setError(null)

    getRoles(controller.signal)
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
  }, [])

  return { data, isLoading, error }
}

