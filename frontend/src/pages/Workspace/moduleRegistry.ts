/**
 * Workspace module metadata for scaffold screens (admin builds out UI per domain).
 * REST paths mirror backend controllers under the same name.
 */

export type ModuleDefinition = {
  path: string
  area: string
  title: string
  description: string
  /** Primary REST collection path */
  apiBase: string
  plannedFeatures: string[]
  relatedRoutes?: { label: string; to: string }[]
}

export const moduleRegistry: Record<string, ModuleDefinition> = {
  '/storage-locations': {
    path: '/storage-locations',
    area: 'Catalog & locations',
    title: 'Storage locations',
    description:
      'Bins, aisles, and pick faces inside each warehouse. Links inventory balances to physical places.',
    apiBase: '/storage-locations',
    plannedFeatures: [
      'Tree or table by warehouse',
      'CRUD with capacity and type',
      'Print location labels',
    ],
    relatedRoutes: [
      { label: 'Warehouses', to: '/warehouses' },
      { label: 'Stock levels', to: '/inventory' },
    ],
  },
  '/products': {
    path: '/products',
    area: 'Catalog & locations',
    title: 'Products',
    description:
      'Master catalog with KPIs, filters, stock distribution, CSV export, and a detail view (modal) backed by /products/catalog and /products/{id}/detail. Owns SKU master data and product CRUD—not on-hand balance grids (use Stock levels).',
    apiBase: '/products',
    plannedFeatures: [
      'Catalog page + product detail modal',
      'Technical specs & warehouse distribution (summary)',
      'Stock movement history',
    ],
    relatedRoutes: [
      { label: 'Categories', to: '/categories' },
      { label: 'Stock levels', to: '/inventory' },
    ],
  },
  '/categories': {
    path: '/categories',
    area: 'Catalog & locations',
    title: 'Categories',
    description:
      'Categories management page: KPI cards, filters, sortable table with product counts, status (ACTIVE/ARCHIVED), bulk archive/delete, CSV export, print.',
    apiBase: '/categories',
    plannedFeatures: ['Implemented list UI', 'Optional future: tree view'],
    relatedRoutes: [{ label: 'Products', to: '/products' }],
  },
  '/inventory': {
    path: '/inventory',
    area: 'Catalog & locations',
    title: 'Stock levels',
    description:
      'On-hand balances (quantity per inventory line via GET /inventory). Not a second product catalog—filters and table only; links to Products, Warehouses, and Stock movements.',
    apiBase: '/inventory',
    plannedFeatures: [
      'Balance table + filters (warehouse, product/SKU)',
      'Row actions: open Product detail, view movements—no second product editor',
      'Export balances (optional)',
    ],
    relatedRoutes: [
      { label: 'Stock movements', to: '/stock-movements' },
      { label: 'Warehouses', to: '/warehouses' },
    ],
  },
  '/stock-movements': {
    path: '/stock-movements',
    area: 'Operations',
    title: 'Stock movements',
    description:
      'Paginated list with filters (warehouse, product, type, date range). Record movements with audit; GET /stock-movements is open for read.',
    apiBase: '/stock-movements',
    plannedFeatures: ['Implemented list + filters + record modal', 'Optional: tie to inventory posting'],
    relatedRoutes: [
      { label: 'Stock levels', to: '/inventory' },
      { label: 'Shipments', to: '/shipments' },
    ],
  },
  '/inventory-allocations': {
    path: '/inventory-allocations',
    area: 'Operations',
    title: 'Inventory allocations',
    description:
      'Paginated allocation list with filters; POST allocate uses FEFO on the backend. GET /inventory-allocations is open for read.',
    apiBase: '/inventory-allocations',
    plannedFeatures: ['Implemented list + filters + allocate modal', 'Optional: per-line release UI'],
    relatedRoutes: [
      { label: 'Orders', to: '/orders' },
      { label: 'Stock levels', to: '/inventory' },
    ],
  },
  '/shipments': {
    path: '/shipments',
    area: 'Operations',
    title: 'Shipments',
    description:
      'Paginated list with filters (status, order, carrier/tracking, shipped-on range). Create draft shipments from orders; mark shipped (carrier + tracking + timestamp); out-for-delivery; proof of delivery; cancel drafts. Backed by GET /shipments and lifecycle POSTs.',
    apiBase: '/shipments',
    plannedFeatures: [
      'Implemented: list, KPIs, create, ship, deliver, status (out / cancel)',
      'Optional: scan by barcode / QR, label print',
    ],
    relatedRoutes: [
      { label: 'Delivery receipts', to: '/delivery-receipts' },
      { label: 'Packages', to: '/packages' },
    ],
  },
  '/delivery-receipts': {
    path: '/delivery-receipts',
    area: 'Operations',
    title: 'Delivery receipts',
    description:
      'Proof-of-delivery records tied to outbound shipments: receiver identity, delivered timestamp, and notes for audit/dispute workflows.',
    apiBase: '/delivery-receipts',
    plannedFeatures: [
      'Implemented: list, filters, create/edit/delete',
      'Shipment-linked POD details and receiver verification',
    ],
    relatedRoutes: [
      { label: 'Shipments', to: '/shipments' },
      { label: 'Orders', to: '/orders' },
    ],
  },
  '/customers': {
    path: '/customers',
    area: 'Sales',
    title: 'Customers',
    description:
      'Customer list with search, pagination, and create/edit/delete (sales.write). Backed by GET/POST/PUT/DELETE /customers.',
    apiBase: '/customers',
    plannedFeatures: [
      'Implemented: list, search, client-side pagination, create/edit modal, delete',
      'Optional: server-side paging, duplicate email guard',
    ],
    relatedRoutes: [{ label: 'Orders', to: '/orders' }],
  },
  '/orders': {
    path: '/orders',
    area: 'Sales',
    title: 'Orders',
    description:
      'Order list with status/customer filters, pagination, detail modal with line items and status updates (PATCH /orders/{id}/status).',
    apiBase: '/orders',
    plannedFeatures: [
      'Implemented: list, filters, detail modal, sales.write status updates',
      'Optional: create order UI, order-items deep link',
    ],
    relatedRoutes: [
      { label: 'Order items', to: '/order-items' },
      { label: 'Customers', to: '/customers' },
    ],
  },
  '/order-items': {
    path: '/order-items',
    area: 'Sales',
    title: 'Order items',
    description:
      'Line-level grid with search, order/product filters, KPIs, CSV export, and line edit/delete (sales.write). Backed by GET /order-items and POST/PUT/DELETE /order-items.',
    apiBase: '/order-items',
    plannedFeatures: [
      'Implemented: list, filters, pagination, export, new line, edit modal, delete',
      'Optional: server-side paging for very large datasets',
    ],
    relatedRoutes: [{ label: 'Orders', to: '/orders' }],
  },
  '/packages': {
    path: '/packages',
    area: 'Packages & codes',
    title: 'Packages',
    description: 'Shipping containers and hierarchy (parcel, pallet).',
    apiBase: '/packages',
    plannedFeatures: ['Package list', 'Create from shipment', 'Weights & dimensions'],
    relatedRoutes: [
      { label: 'Package items', to: '/package-items' },
      { label: 'Shipments', to: '/shipments' },
    ],
  },
  '/package-items': {
    path: '/package-items',
    area: 'Packages & codes',
    title: 'Package items',
    description: 'Contents of each package for traceability.',
    apiBase: '/package-items',
    plannedFeatures: ['Contents grid', 'Scan to add (later)'],
    relatedRoutes: [{ label: 'Packages', to: '/packages' }],
  },
  '/barcodes': {
    path: '/barcodes',
    area: 'Packages & codes',
    title: 'Barcodes',
    description: 'Symbology registry linked to products or locations.',
    apiBase: '/barcodes',
    plannedFeatures: ['Lookup by code', 'Generate & print (later)'],
    relatedRoutes: [{ label: 'Products', to: '/products' }],
  },
  '/qrcodes': {
    path: '/qrcodes',
    area: 'Packages & codes',
    title: 'QR codes',
    description: 'QR payloads for mobile warehouse flows.',
    apiBase: '/qrcodes',
    plannedFeatures: ['Encode / decode tools', 'Link to entities'],
    relatedRoutes: [{ label: 'Packages', to: '/packages' }],
  },
}

export const allModulePaths = Object.keys(moduleRegistry)

export function getModuleDefinition(pathname: string): ModuleDefinition {
  return (
    moduleRegistry[pathname] ?? {
      path: pathname,
      area: 'Workspace',
      title: 'Module',
      description: 'This area will host domain-specific tools and data grids.',
      apiBase: pathname,
      plannedFeatures: ['List & filters', 'Detail drawer', 'Create / edit forms'],
    }
  )
}
