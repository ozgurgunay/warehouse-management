import { Navigate } from 'react-router-dom'

import { useAuth } from './AuthContext'
import type { Capability } from './capabilities'

export function RequireCapability({
  capability,
  children,
}: {
  capability: Capability
  children: React.ReactNode
}) {
  const { currentUser, isLoading, hasCapability } = useAuth()

  if (isLoading) {
    return <div className="app-panel">Loading...</div>
  }

  if (!currentUser || !hasCapability(capability)) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}

