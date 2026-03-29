import { createBrowserRouter, Navigate } from 'react-router-dom'

import { RequireAuth } from '../auth/RequireAuth'
import { RequireCapability } from '../auth/RequireCapability'
import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminHomePage } from '../pages/Admin/AdminHomePage'
import { LoginPage } from '../pages/Auth/LoginPage'
import { ConfirmEmailPage } from '../pages/Auth/ConfirmEmailPage'
import { RegisterPage } from '../pages/Auth/RegisterPage'
import { DashboardPage } from '../pages/Dashboard/DashboardPage'
import { LandingPage } from '../pages/Public/LandingPage'
import { WarehouseDetailPage } from '../pages/Warehouses/WarehouseDetailPage.tsx'
import { WarehousesListPage } from '../pages/Warehouses/WarehousesListPage'
import { ProductsCatalogPage } from '../pages/Products/ProductsCatalogPage'
import { CategoriesPage } from '../pages/Categories/CategoriesPage'
import { StockLevelsPage } from '../pages/Inventory/StockLevelsPage'
import { StockMovementsPage } from '../pages/StockMovements/StockMovementsPage'
import { InventoryAllocationsPage } from '../pages/InventoryAllocations/InventoryAllocationsPage'
import { ShipmentsPage } from '../pages/Shipments/ShipmentsPage'
import { DeliveryReceiptsPage } from '../pages/DeliveryReceipts/DeliveryReceiptsPage'
import { CustomersPage } from '../pages/Customers/CustomersPage'
import { OrdersPage } from '../pages/Orders/OrdersPage'
import { OrderItemsPage } from '../pages/OrderItems/OrderItemsPage'
import { ModuleWorkspacePage } from '../pages/Workspace/ModuleWorkspacePage'
import { StorageLocationsPage } from '../pages/StorageLocations/StorageLocationsPage'
import { MyProfilePage } from '../pages/Account/MyProfilePage.tsx'
import { SettingsPage } from '../pages/Account/SettingsPage.tsx'
import { SupportPage } from '../pages/Account/SupportPage.tsx'

export const router = createBrowserRouter([
  // Public / guest area
  {
    element: <PublicLayout />,
    children: [{ path: '/', element: <LandingPage /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/confirm-email', element: <ConfirmEmailPage /> },
    ],
  },
  // Protected application area
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/app', element: <DashboardPage /> },
          { path: '/warehouses', element: <WarehousesListPage /> },
          { path: '/warehouses/:warehouseId', element: <WarehouseDetailPage /> },
          { path: '/account', element: <Navigate to="/account/profile" replace /> },
          { path: '/account/profile', element: <MyProfilePage /> },
          { path: '/account/settings', element: <SettingsPage /> },
          { path: '/account/support', element: <SupportPage /> },
              {
                path: '/admin',
                element: (
                  <RequireCapability capability="admin.manage_users">
                    <AdminHomePage />
                  </RequireCapability>
                ),
              },
          { path: '/storage-locations', element: <StorageLocationsPage /> },
          { path: '/products', element: <ProductsCatalogPage /> },
          { path: '/categories', element: <CategoriesPage /> },
          { path: '/inventory', element: <StockLevelsPage /> },
          { path: '/stock-movements', element: <StockMovementsPage /> },
          { path: '/inventory-allocations', element: <InventoryAllocationsPage /> },
          { path: '/shipments', element: <ShipmentsPage /> },
          { path: '/delivery-receipts', element: <DeliveryReceiptsPage /> },
          { path: '/customers', element: <CustomersPage /> },
          { path: '/orders', element: <OrdersPage /> },
          { path: '/order-items', element: <OrderItemsPage /> },
          { path: '/packages', element: <ModuleWorkspacePage /> },
          { path: '/package-items', element: <ModuleWorkspacePage /> },
          { path: '/barcodes', element: <ModuleWorkspacePage /> },
          { path: '/qrcodes', element: <ModuleWorkspacePage /> },
        ],
      },
    ],
  },
])

