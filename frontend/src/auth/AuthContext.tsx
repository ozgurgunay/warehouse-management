import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { ApiError } from '../services/apiClient'
import { apiRequest, setAuthHeaderProvider } from '../services/apiClient'
import type { User } from '../features/users/types'
import {
  clearCredentials,
  loadCredentials,
  saveCredentials,
  toBasicAuthHeader,
  type AuthCredentials,
} from './authStorage'
import type { Capability } from './capabilities'
import { roleCapabilities } from './capabilities'

/** Mirrors backend {@code UserDTO} from {@code GET /users/me}. */
export type CurrentUser = User

type AuthState = {
  credentials: AuthCredentials | null
  currentUser: CurrentUser | null
  isLoading: boolean
  error: ApiError | null
  login: (
    credentials: AuthCredentials,
    options?: { rememberMe?: boolean },
  ) => Promise<void>
  logout: () => void
  refreshCurrentUser: () => Promise<void>
  hasRole: (roleName: string) => boolean
  hasCapability: (capability: Capability) => boolean
}

const AuthContext = createContext<AuthState | null>(null)

async function fetchCurrentUser(signal?: AbortSignal) {
  return await apiRequest<User>({ path: '/users/me', signal })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<AuthCredentials | null>(() =>
    loadCredentials(),
  )
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    setAuthHeaderProvider(() =>
      credentials ? toBasicAuthHeader(credentials) : null,
    )
  }, [credentials])

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    setIsLoading(true)
    setError(null)

    if (!credentials) {
      setCurrentUser(null)
      setIsLoading(false)
      return
    }

    fetchCurrentUser(controller.signal)
      .then((user) => {
        if (!isCurrent) return
        setCurrentUser(user)
      })
      .catch((err: unknown) => {
        if (!isCurrent) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        setCurrentUser(null)
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
  }, [credentials])

  const refreshCurrentUser = useCallback(async () => {
    if (!credentials) return
    const user = await fetchCurrentUser()
    setCurrentUser(user)
    setError(null)
  }, [credentials])

  const login = useMemo(
    () =>
      async (next: AuthCredentials, options?: { rememberMe?: boolean }) => {
        const rememberMe = options?.rememberMe ?? true

        setCredentials(next)
        if (rememberMe) saveCredentials(next)
        else clearCredentials()

        try {
          const user = await fetchCurrentUser()
          setCurrentUser(user)
          setError(null)
        } catch (err) {
          clearCredentials()
          setCredentials(null)
          setCurrentUser(null)
          setError(err as ApiError)
          throw err
        }
      },
    [],
  )

  const logout = useMemo(
    () => () => {
      clearCredentials()
      setCredentials(null)
      setCurrentUser(null)
      setError(null)
    },
    [],
  )

  const hasRole = useMemo(
    () => (roleName: string) =>
      !!currentUser?.roleDTOs?.some((r) => r.name === roleName),
    [currentUser],
  )

  const hasCapability = useMemo(
    () => (capability: Capability) => {
      const roleNames = currentUser?.roleDTOs?.map((r) => r.name) ?? []
      for (const roleName of roleNames) {
        const caps = roleCapabilities[roleName] ?? []
        if (caps.includes(capability)) return true
      }
      return false
    },
    [currentUser],
  )

  const value: AuthState = {
    credentials,
    currentUser,
    isLoading,
    error,
    login,
    logout,
    refreshCurrentUser,
    hasRole,
    hasCapability,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

