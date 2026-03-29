import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { listCustomers } from '../../features/customers/api'
import { getAllocationsPage } from '../../features/inventory-allocations/api'
import { listOrders } from '../../features/orders/api'
import { formatMoneyUsd } from '../../features/orders/format'
import { getProductStats } from '../../features/products/api'
import { getShipmentsPage } from '../../features/shipments/api'
import { getStockMovementsPage } from '../../features/stock-movements/api'
import type { MovementType, StockMovementDto } from '../../features/stock-movements/types'
import { getWarehouseStats } from '../../features/warehouses/api'
import { isAbortError, type ApiError } from '../../services/apiClient'

import './dashboardPage.css'

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function movementPillClass(t: MovementType): string {
  switch (t) {
    case 'INBOUND':
      return 'dash-movement-type dash-movement-type--in'
    case 'OUTBOUND':
      return 'dash-movement-type dash-movement-type--out'
    case 'TRANSFER':
      return 'dash-movement-type dash-movement-type--tr'
    default:
      return 'dash-movement-type'
  }
}

type Snapshot = {
  warehouseStats: Awaited<ReturnType<typeof getWarehouseStats>> | null
  productStats: Awaited<ReturnType<typeof getProductStats>> | null
  orders: Awaited<ReturnType<typeof listOrders>> | null
  shipPending: number | null
  shipTransit: number | null
  shipOut: number | null
  allocationsActive: number | null
  movements: StockMovementDto[]
  movementsTotal: number | null
  customerCount: number | null
}

const emptySnapshot = (): Snapshot => ({
  warehouseStats: null,
  productStats: null,
  orders: null,
  shipPending: null,
  shipTransit: null,
  shipOut: null,
  allocationsActive: null,
  movements: [],
  movementsTotal: null,
  customerCount: null,
})

export function DashboardPage() {
  const { hasCapability } = useAuth()
  const canOps = hasCapability('operations.write')
  const canSales = hasCapability('sales.write')
  const canInv = hasCapability('inventory.write')
  const canWh = hasCapability('warehouses.write')
  const canAdmin = hasCapability('admin.manage_users')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [partialError, setPartialError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot())
  const [reloadTick, setReloadTick] = useState(0)

  const refresh = useCallback(() => setReloadTick((x) => x + 1), [])

  useEffect(() => {
    const ac = new AbortController()
    let alive = true
    setLoading(true)
    setLoadError(null)
    setPartialError(null)

    const run = async () => {
      const settled = await Promise.allSettled([
        getWarehouseStats(ac.signal),
        getProductStats(ac.signal),
        listOrders({ page: 0, size: 500 }, ac.signal),
        getShipmentsPage({ page: 0, size: 1, status: 'PENDING' }, ac.signal),
        getShipmentsPage({ page: 0, size: 1, status: 'IN_TRANSIT' }, ac.signal),
        getShipmentsPage({ page: 0, size: 1, status: 'OUT_FOR_DELIVERY' }, ac.signal),
        getAllocationsPage({ page: 0, size: 1, status: 'ACTIVE' }, ac.signal),
        getStockMovementsPage({ page: 0, size: 10 }, ac.signal),
        listCustomers(ac.signal),
      ])

      if (!alive || ac.signal.aborted) return

      const labels = [
        'warehouses',
        'products',
        'orders',
        'shipments (pending)',
        'shipments (in transit)',
        'shipments (out for delivery)',
        'allocations',
        'stock movements',
        'customers',
      ] as const

      const failed: string[] = []
      settled.forEach((r, i) => {
        if (r.status === 'rejected' && !isAbortError(r.reason)) {
          failed.push(labels[i])
        }
      })

      const next = emptySnapshot()
      if (settled[0].status === 'fulfilled') next.warehouseStats = settled[0].value
      if (settled[1].status === 'fulfilled') next.productStats = settled[1].value
      if (settled[2].status === 'fulfilled') next.orders = settled[2].value
      if (settled[3].status === 'fulfilled') next.shipPending = settled[3].value.totalElements
      if (settled[4].status === 'fulfilled') next.shipTransit = settled[4].value.totalElements
      if (settled[5].status === 'fulfilled') next.shipOut = settled[5].value.totalElements
      if (settled[6].status === 'fulfilled') next.allocationsActive = settled[6].value.totalElements
      if (settled[7].status === 'fulfilled') {
        next.movements = settled[7].value.content
        next.movementsTotal = settled[7].value.totalElements
      }
      if (settled[8].status === 'fulfilled') next.customerCount = settled[8].value.length

      if (failed.length === settled.length) {
        const first = settled.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined
        setLoadError((first?.reason as ApiError)?.message ?? 'Failed to load dashboard data.')
        setSnapshot(emptySnapshot())
      } else {
        setSnapshot(next)
        if (failed.length > 0) {
          setPartialError(`Some figures could not be loaded: ${failed.join(', ')}.`)
        }
      }
      setLoading(false)
    }

    void run()
    return () => {
      alive = false
      ac.abort()
    }
  }, [reloadTick])

  const ordersOpen = useMemo(() => {
    const list = snapshot.orders ?? []
    return list.filter((o) => ['PENDING', 'APPROVED', 'PACKING'].includes(o.status)).length
  }, [snapshot.orders])

  const shipmentsActive = useMemo(() => {
    const a = snapshot.shipPending ?? 0
    const b = snapshot.shipTransit ?? 0
    const c = snapshot.shipOut ?? 0
    if (snapshot.shipPending == null && snapshot.shipTransit == null && snapshot.shipOut == null) return null
    return a + b + c
  }, [snapshot.shipPending, snapshot.shipTransit, snapshot.shipOut])

  const wh = snapshot.warehouseStats
  const ps = snapshot.productStats

  return (
    <div className="ds-page dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="ds-page-title">Operations overview</h1>
          <p className="dash-page-subtitle">
            A live snapshot of warehouses, catalog health, sales backlog, outbound logistics, and recent stock
            movements — powered by your REST APIs.
          </p>
        </div>
        <button type="button" className="ds-btn-ghost" disabled={loading} onClick={refresh}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loadError ? (
        <div className="dash-error-banner" role="alert">
          {loadError}{' '}
          <button type="button" className="ds-btn-primary" style={{ marginLeft: 10 }} onClick={refresh}>
            Retry
          </button>
        </div>
      ) : null}

      {partialError && !loadError ? (
        <p className="app-muted" style={{ marginBottom: 12, fontWeight: 700 }} role="status">
          {partialError}
        </p>
      ) : null}

      <div className="ds-stat-grid dash-kpi-grid">
        <div className="ds-stat-card dash-kpi-card dash-kpi-card--teal">
          <div className="ds-stat-label">Warehouses</div>
          <div className="ds-stat-value dash-num">
            {loading && !wh ? '…' : wh != null ? wh.totalWarehouses.toLocaleString('en-US') : '—'}
          </div>
          <div className="dash-kpi-sub">
            {wh != null
              ? `Avg. occupancy ${wh.averageOccupancyPercent.toFixed(1)}% · ${wh.totalCapacityM2Sum.toLocaleString('en-US')} m² capacity (sum)`
              : 'Facility footprint'}
          </div>
        </div>

        <div className="ds-stat-card dash-kpi-card dash-kpi-card--blue">
          <div className="ds-stat-label">Active SKUs</div>
          <div className="ds-stat-value dash-num">
            {loading && !ps ? '…' : ps != null ? ps.totalSku.toLocaleString('en-US') : '—'}
          </div>
          <div className="dash-kpi-sub">
            {ps != null
              ? `${ps.lowStockSkuCount.toLocaleString('en-US')} below threshold · ${ps.recentlyUpdatedCount.toLocaleString('en-US')} updated (7d)`
              : 'Catalog breadth'}
          </div>
        </div>

        <div className="ds-stat-card dash-kpi-card dash-kpi-card--violet">
          <div className="ds-stat-label">Inventory value (est.)</div>
          <div className="ds-stat-value dash-num">
            {loading && !ps ? '…' : ps != null ? formatMoneyUsd(ps.totalInventoryValue) : '—'}
          </div>
          <div className="dash-kpi-sub">
            {ps != null ? `Avg. unit price ${formatMoneyUsd(ps.averageUnitPrice)}` : 'From product master × availability'}
          </div>
        </div>

        <div className="ds-stat-card dash-kpi-card dash-kpi-card--amber">
          <div className="ds-stat-label">Orders to fulfill</div>
          <div className="ds-stat-value dash-num">
            {loading && snapshot.orders == null ? '…' : ordersOpen.toLocaleString('en-US')}
          </div>
          <div className="dash-kpi-sub">Pending, approved, or picking (up to 500 orders loaded)</div>
        </div>

        <div className="ds-stat-card dash-kpi-card dash-kpi-card--slate">
          <div className="ds-stat-label">Outbound pipeline</div>
          <div className="ds-stat-value dash-num">
            {loading && shipmentsActive == null ? '…' : shipmentsActive != null ? shipmentsActive.toLocaleString('en-US') : '—'}
          </div>
          <div className="dash-kpi-sub">
            Shipments: pending + in transit + out for delivery (server counts)
          </div>
        </div>

        <div className="ds-stat-card dash-kpi-card dash-kpi-card--rose">
          <div className="ds-stat-label">Active allocations</div>
          <div className="ds-stat-value dash-num">
            {loading && snapshot.allocationsActive == null
              ? '…'
              : snapshot.allocationsActive != null
                ? snapshot.allocationsActive.toLocaleString('en-US')
                : '—'}
          </div>
          <div className="dash-kpi-sub">Stock reserved against orders (FEFO reservations)</div>
        </div>
      </div>

      <div className="dash-two-col">
        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Recent stock movements</h2>
            <Link to="/stock-movements" className="ds-link-accent" style={{ fontSize: 13, fontWeight: 800 }}>
              View all
            </Link>
          </div>
          {loading && snapshot.movements.length === 0 ? (
            <p className="app-muted" style={{ fontWeight: 700 }}>
              Loading movements…
            </p>
          ) : snapshot.movements.length === 0 ? (
            <p className="app-muted" style={{ fontWeight: 700 }}>
              No movements recorded yet.
            </p>
          ) : (
            <>
              <div className="ds-table-wrap">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>SKU</th>
                      <th className="dash-num">Qty</th>
                      <th>Warehouse</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.movements.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <span className={movementPillClass(row.movementType)}>{row.movementType}</span>
                        </td>
                        <td style={{ fontWeight: 800 }}>{row.productSku ?? `#${row.productId}`}</td>
                        <td className="dash-num" style={{ fontWeight: 900 }}>
                          {row.quantityChange > 0 ? '+' : ''}
                          {row.quantityChange}
                        </td>
                        <td>{row.warehouseCode ?? '—'}</td>
                        <td className="dash-num" style={{ fontSize: 12 }}>
                          {formatShortDate(row.movementDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {snapshot.movementsTotal != null ? (
                <p className="app-muted" style={{ marginTop: 10, fontSize: 12, fontWeight: 700 }}>
                  {snapshot.movementsTotal.toLocaleString('en-US')} movements in total (filtered list on the movements
                  page).
                </p>
              ) : null}
            </>
          )}
        </section>

        <div style={{ display: 'grid', gap: 14 }}>
          <section className="dash-panel">
            <h2 className="dash-panel-title">Attention</h2>
            <div className="dash-alert-row">
              <div>
                <div style={{ fontWeight: 900, fontSize: 14 }}>Low-stock SKUs</div>
                <div className="dash-kpi-sub" style={{ marginTop: 4 }}>
                  {ps != null
                    ? `${ps.lowStockSkuCount.toLocaleString('en-US')} products under their threshold`
                    : 'Catalog signal unavailable'}
                </div>
              </div>
              <Link to="/products" className="ds-btn-primary" style={{ textDecoration: 'none', flexShrink: 0 }}>
                Catalog
              </Link>
            </div>
            <div className="dash-alert-row">
              <div>
                <div style={{ fontWeight: 900, fontSize: 14 }}>Orders backlog</div>
                <div className="dash-kpi-sub" style={{ marginTop: 4 }}>
                  {snapshot.orders != null
                    ? `${ordersOpen.toLocaleString('en-US')} lines need fulfillment attention`
                    : 'Sales data unavailable'}
                </div>
              </div>
              <Link to="/orders" className="ds-btn-ghost" style={{ textDecoration: 'none', flexShrink: 0 }}>
                Orders
              </Link>
            </div>
            <div className="dash-alert-row">
              <div>
                <div style={{ fontWeight: 900, fontSize: 14 }}>Customers</div>
                <div className="dash-kpi-sub" style={{ marginTop: 4 }}>
                  {snapshot.customerCount != null
                    ? `${snapshot.customerCount.toLocaleString('en-US')} sold-to accounts`
                    : '—'}
                </div>
              </div>
              <Link to="/customers" className="ds-btn-ghost" style={{ textDecoration: 'none', flexShrink: 0 }}>
                Customers
              </Link>
            </div>
          </section>

          <section className="dash-panel">
            <h2 className="dash-panel-title">Quick actions</h2>
            <div className="dash-quick-actions">
              {canOps ? (
                <Link to="/stock-movements" className="ds-btn-primary" style={{ textDecoration: 'none' }}>
                  Record movement
                </Link>
              ) : null}
              {canOps ? (
                <Link to="/shipments" className="ds-btn-ghost" style={{ textDecoration: 'none' }}>
                  Shipments
                </Link>
              ) : null}
              {canOps ? (
                <Link to="/inventory-allocations" className="ds-btn-ghost" style={{ textDecoration: 'none' }}>
                  Allocate stock
                </Link>
              ) : null}
              {canSales ? (
                <Link to="/orders" className="ds-btn-ghost" style={{ textDecoration: 'none' }}>
                  Orders
                </Link>
              ) : null}
              {canInv ? (
                <Link to="/products" className="ds-btn-ghost" style={{ textDecoration: 'none' }}>
                  Products
                </Link>
              ) : null}
              {canWh ? (
                <Link to="/warehouses" className="ds-btn-ghost" style={{ textDecoration: 'none' }}>
                  Warehouses
                </Link>
              ) : null}
              {canAdmin ? (
                <Link to="/admin" className="ds-btn-ghost" style={{ textDecoration: 'none' }}>
                  Administration
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      <p className="app-muted" style={{ marginTop: 16, fontSize: 12, fontWeight: 600 }}>
        KPIs load from public GET endpoints in development; creating or changing data still requires authentication and
        the right capability.
      </p>
    </div>
  )
}
