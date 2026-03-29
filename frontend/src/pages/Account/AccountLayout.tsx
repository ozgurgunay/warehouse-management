import { useMemo, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

import './accountLayout.css'

export type AccountSectionKey = 'profile' | 'settings' | 'support'

export function AccountLayout({
  active,
  children,
}: {
  active: AccountSectionKey
  children: ReactNode
}) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const initials = useMemo(() => {
    const s = 'User'
    return s.slice(0, 1).toUpperCase()
  }, [])

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="account-shell">
      <div className="account-left">
        <div className="account-left-card" data-active={active}>
          <div className="account-menu-title">Menu</div>

          <NavLink
            to="/account/profile"
            className={({ isActive }) =>
              isActive
                ? 'account-menu-link account-menu-link--active'
                : 'account-menu-link'
            }
          >
            <span aria-hidden="true">{initials}</span>
            My profile
          </NavLink>

          <div className="account-left-footer">
            <button type="button" className="account-logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="account-right">{children}</div>
    </div>
  )
}

