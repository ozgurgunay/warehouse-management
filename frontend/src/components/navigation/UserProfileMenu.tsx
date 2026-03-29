import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

export function UserProfileMenu() {
  const { currentUser, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const navigateAndClose = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  useEffect(() => {
    const onDocumentPointerDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (e.target instanceof Node && wrapperRef.current.contains(e.target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', onDocumentPointerDown)
    return () => document.removeEventListener('mousedown', onDocumentPointerDown)
  }, [])

  const roleLabel = useMemo(() => {
    if (!currentUser) return 'USER ACCESS'
    if (hasRole('ROLE_ADMIN')) return 'SUPERUSER ACCESS'
    return 'USER ACCESS'
  }, [currentUser, hasRole])

  const displayName = currentUser?.username?.trim() || 'User'

  const avatarLetter = useMemo(() => {
    const u = currentUser?.username?.trim()
    if (!u) return '?'
    return u.slice(0, 1).toUpperCase()
  }, [currentUser?.username])

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-profile-wrap" ref={wrapperRef}>
      <div className="app-profile-icons" aria-hidden="true">
        <button type="button" className="app-header-icon-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2Z"
              fill="currentColor"
            />
            <path
              d="M18 16v-5c0-3.1-1.6-5.7-4.5-6.3V4c0-.8-.7-1.5-1.5-1.5S10.5 3.2 10.5 4v.7C7.6 5.3 6 7.9 6 11v5l-1.4 1.4c-.6.6-.2 1.6.7 1.6h13.4c.9 0 1.3-1 .7-1.6L18 16Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button type="button" className="app-header-icon-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className="app-profile-pill"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((x) => !x)}
      >
        <span className="app-profile-avatar" aria-hidden="true">
          {avatarLetter}
        </span>
        <span className="app-profile-meta">
          <span className="app-profile-name">{displayName}</span>
          <span className="app-profile-role">{roleLabel}</span>
        </span>
        <span className="app-profile-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div className="app-profile-dropdown" role="menu">
          <button
            type="button"
            className="app-dropdown-item"
            onClick={() => navigateAndClose('/account/profile')}
          >
            My Profile
          </button>
          <button
            type="button"
            className="app-dropdown-item"
            onClick={() => navigateAndClose('/app')}
          >
            Dashboard
          </button>
          {hasRole('ROLE_ADMIN') ? (
            <button
              type="button"
              className="app-dropdown-item"
              onClick={() => navigateAndClose('/admin')}
            >
              Admin
            </button>
          ) : null}
          <button
            type="button"
            className="app-dropdown-item"
            onClick={() => navigateAndClose('/account/settings')}
          >
            Settings
          </button>
          <button
            type="button"
            className="app-dropdown-item"
            onClick={() => navigateAndClose('/account/support')}
          >
            Support
          </button>
          <button type="button" className="app-dropdown-item" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}

