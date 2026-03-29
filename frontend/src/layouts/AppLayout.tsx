import { Outlet } from 'react-router-dom'

import { useLocation } from 'react-router-dom'

import { AppSidebar } from '../components/navigation/AppSidebar'
import { UserProfileMenu } from '../components/navigation/UserProfileMenu'

import './appLayout.css'
/* Load after app shell styles so ds-* tokens win over legacy .app-* rules */
import '../styles/design-system.css'

export function AppLayout() {
  const location = useLocation()

  const pathname = location.pathname

  const { pageTitle, pageSubtitle } = (() => {
    if (pathname === '/app')
      return {
        pageTitle: 'Dashboard',
        pageSubtitle: 'Live KPIs, recent movements, and shortcuts across warehouse operations.',
      }

    if (pathname.startsWith('/warehouses/'))
      return {
        pageTitle: 'Warehouse detail',
        pageSubtitle: 'Review warehouse information and operational data.',
      }

    if (pathname === '/warehouses')
      return {
        pageTitle: 'Warehouses',
        pageSubtitle: 'Manage your warehouse master data.',
      }

    if (pathname === '/storage-locations')
      return {
        pageTitle: 'Storage Locations',
        pageSubtitle: 'Manage storage locations inside warehouses.',
      }

    if (pathname === '/products')
      return {
        pageTitle: 'Products catalog',
        pageSubtitle: 'SKU master data, stock distribution, and audit trail.',
      }

    if (pathname === '/categories')
      return {
        pageTitle: 'Categories',
        pageSubtitle: 'Organize products into categories.',
      }

    if (pathname === '/inventory')
      return {
        pageTitle: 'Stock levels',
        pageSubtitle: 'On-hand quantity by product, warehouse, and bin.',
      }

    if (pathname === '/stock-movements')
      return {
        pageTitle: 'Stock Movements',
        pageSubtitle: 'Audit inbound/outbound stock movements.',
      }

    if (pathname === '/inventory-allocations')
      return {
        pageTitle: 'Inventory Allocations',
        pageSubtitle: 'Reserve stock for orders and operations.',
      }

    if (pathname === '/shipments')
      return {
        pageTitle: 'Shipments',
        pageSubtitle: 'Plan and track shipments end-to-end.',
      }

    if (pathname === '/delivery-receipts')
      return {
        pageTitle: 'Delivery Receipts',
        pageSubtitle: 'Confirm deliveries and update inventory status.',
      }

    if (pathname === '/customers')
      return {
        pageTitle: 'Customers',
        pageSubtitle: 'Manage customers and their contact information.',
      }

    if (pathname === '/orders')
      return {
        pageTitle: 'Orders',
        pageSubtitle: 'Create and manage orders with status tracking.',
      }

    if (pathname === '/order-items')
      return {
        pageTitle: 'Order Items',
        pageSubtitle: 'Manage order lines and related items.',
      }

    if (pathname === '/packages')
      return {
        pageTitle: 'Packages',
        pageSubtitle: 'Create packages and manage package contents.',
      }

    if (pathname === '/package-items')
      return {
        pageTitle: 'Package Items',
        pageSubtitle: 'Manage the items inside packages.',
      }

    if (pathname === '/barcodes')
      return {
        pageTitle: 'Barcodes',
        pageSubtitle: 'Generate and manage barcode identifiers.',
      }

    if (pathname === '/qrcodes')
      return {
        pageTitle: 'QR Codes',
        pageSubtitle: 'Generate and manage QR code identifiers.',
      }

    if (pathname === '/admin')
      return {
        pageTitle: 'Admin',
        pageSubtitle: 'Role and user management (admin only).',
      }

    if (pathname === '/account/profile')
      return {
        pageTitle: 'My Profile',
        pageSubtitle: 'Update your personal information and profile photo.',
      }

    if (pathname === '/account/settings')
      return {
        pageTitle: 'Settings',
        pageSubtitle: 'Manage your account preferences.',
      }

    if (pathname === '/account/support')
      return {
        pageTitle: 'Support',
        pageSubtitle: 'Contact support and find help.',
      }

    return {
      pageTitle: 'Dashboard',
      pageSubtitle: 'Operational overview.',
    }
  })()

  return (
    <div className="app-theme">
      <div className="app-layout">
        <AppSidebar />

        <div className="app-main">
          <header className="app-main-header">
            <div>
              <div className="app-page-title">{pageTitle}</div>
              <div className="app-page-subtitle">{pageSubtitle}</div>
            </div>

            <div className="app-header-actions">
              <UserProfileMenu />
            </div>
          </header>

          <main className="app-main-body">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

