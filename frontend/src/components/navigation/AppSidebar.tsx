import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

type SidebarLinkProps = {
  to: string
  label: string
  icon: ReactNode
  isEnd?: boolean
}

function SidebarLink({ to, label, icon, isEnd }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      end={isEnd}
      className={({ isActive }) =>
        isActive
          ? 'app-sidebar-link app-sidebar-link-active'
          : 'app-sidebar-link'
      }
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </NavLink>
  )
}

export function AppSidebar() {
  const { hasCapability } = useAuth()

  return (
    <aside className="app-sidebar" aria-label="Application sidebar">
      <div className="app-sidebar-brand">
        <div className="app-sidebar-logo" aria-hidden="true">
          WM
        </div>
        <div className="app-sidebar-title">WAREHOUSE</div>
      </div>

      <div className="app-sidebar-section">
        <SidebarLink
          to="/app"
          label="Dashboard"
          isEnd
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 13h6V4H4v9Zm10 7h6V11h-6v9ZM4 20h6v-5H4v5Zm10-9h6V4h-6v7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      <div className="app-sidebar-section">
        <div className="app-sidebar-section-title">Catalog &amp; locations</div>
        <div className="app-sidebar-subitems">
          <NavLink to="/warehouses" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7l8-4 8 4-8 4-8-4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 7v10l8 4 8-4V7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Warehouses
          </NavLink>
          <NavLink to="/storage-locations" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6h-8M14 12H4m10 6H4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Storage Locations
          </NavLink>

          <NavLink to="/products" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 7h12M6 17h12M9 7v10m6-10v10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Products
          </NavLink>

          <NavLink to="/categories" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 6v-6h6v6h-6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Categories
          </NavLink>

          <NavLink to="/inventory" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h4v10H4V7Zm6 0h10v4H10V7Zm0 6h6v4h-6v-4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Stock levels
          </NavLink>
        </div>
      </div>

      <div className="app-sidebar-section">
        <div className="app-sidebar-section-title">Operations</div>
        <div className="app-sidebar-subitems">
          <NavLink to="/stock-movements" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12h18M12 3v18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Stock Movements
          </NavLink>
          <NavLink to="/inventory-allocations" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 11c1.7 0 3-1.3 3-3S17.7 5 16 5s-3 1.3-3 3 1.3 3 3 3ZM8 11c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M2 19c0-2.2 2.2-4 6-4s6 1.8 6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M14 19c0-2.2 2.2-4 6-4s6 1.8 6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Allocations
          </NavLink>
          <NavLink to="/shipments" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7l9-4 9 4v10l-9 4-9-4V7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22V12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Shipments
          </NavLink>
          <NavLink to="/delivery-receipts" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 4h10v16H7V4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 8h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9 12h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Delivery Receipts
          </NavLink>
        </div>
      </div>

      <div className="app-sidebar-section">
        <div className="app-sidebar-section-title">Sales</div>
        <div className="app-sidebar-subitems">
          <NavLink to="/customers" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Customers
          </NavLink>
          <NavLink to="/orders" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 11h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9 16h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9 6h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M5 3h14v18H5V3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Orders
          </NavLink>
          <NavLink to="/order-items" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 7h10v10H7V7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 4h16v16H4V4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  opacity="0.5"
                />
              </svg>
            </span>
            Order Items
          </NavLink>
        </div>
      </div>

      <div className="app-sidebar-section">
        <div className="app-sidebar-section-title">Packages & Codes</div>
        <div className="app-sidebar-subitems">
          <NavLink to="/packages" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7l9-4 9 4-9 4-9-4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 7v10l9 4 9-4V7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Packages
          </NavLink>
          <NavLink to="/package-items" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 7h10v10H7V7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 4h16v16H4V4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  opacity="0.5"
                />
              </svg>
            </span>
            Package Items
          </NavLink>
          <NavLink to="/barcodes" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7v10M7 7v10M10 7v10M13 7v10M16 7v10M19 7v10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Barcodes
          </NavLink>
          <NavLink to="/qrcodes" className="app-sidebar-subitem">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm8 8v-4h2v2h2v2h-4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            QR Codes
          </NavLink>
        </div>
      </div>

      {hasCapability('admin.manage_users') ? (
        <div className="app-sidebar-section">
          <div className="app-sidebar-section-title">Admin</div>
          <SidebarLink
            to="/admin"
            label="Admin"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </div>
      ) : null}

      <div className="app-sidebar-section">
        <div className="app-sidebar-subitems">
          <NavLink
            to="/account/settings"
            className={({ isActive }) =>
              isActive
                ? 'app-sidebar-subitem app-sidebar-subitem--active'
                : 'app-sidebar-subitem'
            }
          >
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16 7h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="14"
                  cy="7"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M4 17h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M10 17h10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="8"
                  cy="17"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            Settings
          </NavLink>

          <NavLink
            to="/account/support"
            className={({ isActive }) =>
              isActive
                ? 'app-sidebar-subitem app-sidebar-subitem--active'
                : 'app-sidebar-subitem'
            }
          >
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9.1 9a3 3 0 1 1 5.8 1c-.7 1.3-2 1.4-2 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 17h.01"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            Support
          </NavLink>
        </div>
      </div>
    </aside>
  )
}

