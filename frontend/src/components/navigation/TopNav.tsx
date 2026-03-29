import { NavLink } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'app-nav-link app-nav-link-active' : 'app-nav-link'

export function TopNav() {
  const { currentUser, logout, hasRole } = useAuth()

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <nav className="app-nav" aria-label="Main navigation">
        <NavLink to="/app" className={getNavLinkClassName} end>
          Dashboard
        </NavLink>
        <NavLink to="/warehouses" className={getNavLinkClassName}>
          Warehouses
        </NavLink>
        {hasRole('ROLE_ADMIN') ? (
          <NavLink to="/admin" className={getNavLinkClassName}>
            Admin
          </NavLink>
        ) : null}
      </nav>

      <div className="badge">{currentUser?.username}</div>
      <button type="button" className="button-primary" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

