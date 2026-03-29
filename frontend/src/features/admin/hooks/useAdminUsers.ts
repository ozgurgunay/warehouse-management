import { useEffect, useState } from 'react'

import type { ApiError } from '../../../services/apiClient'
import { getUsers } from '../api'
import type { User } from '../types'

export function useAdminUsers() {
  const [data, setData] = useState<User[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    setIsLoading(true)
    setError(null)

    getUsers(controller.signal)
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

