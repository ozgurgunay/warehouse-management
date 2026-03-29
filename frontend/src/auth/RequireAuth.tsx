import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { credentials, currentUser, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="card">
        <div className="badge">Auth</div>
        <h2 style={{ marginTop: 10 }}>Loading...</h2>
        <p style={{ marginTop: 8 }}>Checking your session.</p>
      </div>
    )
  }

  if (!credentials || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

