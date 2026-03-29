import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import {
  displayWarehouseCode,
  formatM2,
  formatPercent,
  occupancyPercent,
  occupancyTone,
  warehouseStatusLabel,
} from '../../features/warehouses/format'
import { useWarehouses } from '../../features/warehouses/hooks/useWarehouses'
import { useWarehouseStats } from '../../features/warehouses/hooks/useWarehouseStats'
import type { Warehouse } from '../../features/warehouses/types'

import { WarehouseDeleteModal } from './WarehouseDeleteModal'
import { WarehouseFormModal } from './WarehouseFormModal'

const PAGE_SIZE = 8

type CapacityBand = 'all' | 'small' | 'medium' | 'large'

function matchesCapacityBand(w: Warehouse, band: CapacityBand): boolean {
  const max = w.maxCapacityM2
  if (band === 'all') return true
  if (max === null || max === undefined) return false
  if (band === 'small') return max < 50_000
  if (band === 'medium') return max >= 50_000 && max <= 200_000
  return max > 200_000
}

function compareWarehouses(a: Warehouse, b: Warehouse) {
  return displayWarehouseCode(a).localeCompare(displayWarehouseCode(b), undefined, {
    sensitivity: 'base',
  })
}

function IconWarehouse() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconGauge() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconRuler() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 19L19 5M8 16l2-2M11 13l2-2M14 10l2-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.83l-1.67-1.67a2 2 0 0 0-2.83 0L4 15.5V20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconMap() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 20l-5 2V6l5-3 6 3 5-2v14l-5 3-6-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2" fill="currentColor" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7h12M10 11v6M14 11v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M8 7h8l-1 13a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1L8 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSliders() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M8 12h8M10 18h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="6" cy="6" r="1.6" fill="currentColor" />
      <circle cx="16" cy="12" r="1.6" fill="currentColor" />
      <circle cx="14" cy="18" r="1.6" fill="currentColor" />
    </svg>
  )
}

function statusBadgeClass(status: Warehouse['status']): string {
  if (status === 'ACTIVE') return 'ds-badge ds-badge--success'
  if (status === 'FULL') return 'ds-badge ds-badge--danger'
  return 'ds-badge ds-badge--warning'
}

export function WarehousesListPage() {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('warehouses.write')

  const { data, isLoading, error, refetch } = useWarehouses()
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useWarehouseStats()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [regionFilter, setRegionFilter] = useState<string>('')
  const [capacityBand, setCapacityBand] = useState<CapacityBand>('all')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Warehouse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null)

  const regionOptions = useMemo(() => {
    if (!data) return []
    const s = new Set<string>()
    for (const w of data) {
      const r = w.region?.trim()
      if (r) s.add(r)
    }
    return [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [data])

  const regionCount = useMemo(() => regionOptions.length, [regionOptions])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data
      .filter((w) => {
        if (statusFilter && w.status !== statusFilter) return false
        if (regionFilter && (w.region?.trim() || '') !== regionFilter) return false
        if (!matchesCapacityBand(w, capacityBand)) return false
        if (!q) return true
        const hay = `${displayWarehouseCode(w)} ${w.name} ${w.location} ${w.region ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
      .sort(compareWarehouses)
  }, [data, search, statusFilter, regionFilter, capacityBand])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, regionFilter, capacityBand, data])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const refreshAll = () => {
    refetch()
    refetchStats()
  }

  const openInMaps = (w: Warehouse) => {
    const q = encodeURIComponent(w.location)
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener,noreferrer')
  }

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(filtered.length, safePage * PAGE_SIZE)

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Inventory</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Warehouses</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">Warehouses</h1>
        </div>
        {canWrite ? (
          <button type="button" className="ds-btn-primary" onClick={() => setCreateOpen(true)}>
            <span className="ds-btn-primary-icon" aria-hidden>
              +
            </span>
            Create New Warehouse
          </button>
        ) : null}
      </div>

      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Total Warehouses</div>
              <div className="ds-stat-value">
                {statsLoading ? '…' : statsError ? '—' : stats?.totalWarehouses ?? '—'}
              </div>
              <div className="ds-stat-sub">Live count from your catalog</div>
            </div>
            <div className="ds-stat-icon" aria-hidden>
              <IconWarehouse />
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Avg. Occupancy</div>
              <div className="ds-stat-value">
                {statsLoading ? '…' : statsError ? '—' : formatPercent(stats?.averageOccupancyPercent)}
              </div>
              <div className="ds-stat-sub">Weighted by total m² capacity</div>
              {!statsLoading && stats && !statsError ? (
                <div style={{ marginTop: 10 }}>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: 'rgba(15,23,42,0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, stats.averageOccupancyPercent)}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #0a5a5a, #0f766e)',
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <div className="ds-stat-icon" aria-hidden>
              <IconGauge />
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Total Capacity</div>
              <div className="ds-stat-value" style={{ fontSize: 20 }}>
                {statsLoading ? '…' : statsError ? '—' : stats ? formatM2(stats.totalCapacityM2Sum) : '—'}
              </div>
              <div className="ds-stat-sub">
                {regionCount > 0 ? `Across ${regionCount} region${regionCount === 1 ? '' : 's'}` : 'Add regions to organize sites'}
              </div>
            </div>
            <div className="ds-stat-icon" aria-hidden>
              <IconRuler />
            </div>
          </div>
        </div>
      </div>

      <div className="ds-toolbar">
        <div className="ds-search-wrap">
          <span className="ds-search-icon" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            className="ds-search-input"
            placeholder="Search by Warehouse ID or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search warehouses"
          />
        </div>
        <select
          className="ds-filter-select"
          aria-label="Status filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Status: All</option>
          <option value="ACTIVE">Active</option>
          <option value="FULL">Full</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        <select
          className="ds-filter-select"
          aria-label="Region filter"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <option value="">Region: All</option>
          {regionOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="ds-filter-select"
          aria-label="Capacity filter"
          value={capacityBand}
          onChange={(e) => setCapacityBand(e.target.value as CapacityBand)}
        >
          <option value="all">Capacity: All</option>
          <option value="small">Small (&lt; 50k m²)</option>
          <option value="medium">Medium (50k – 200k m²)</option>
          <option value="large">Large (&gt; 200k m²)</option>
        </select>
        <button
          type="button"
          className="ds-icon-button"
          aria-label="Focus search"
          onClick={() => document.querySelector<HTMLInputElement>('.ds-search-input')?.focus()}
        >
          <IconSliders />
        </button>
        <button type="button" className="ds-btn-ghost" onClick={refreshAll}>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <p className="app-muted" style={{ marginTop: 8 }}>
          Loading warehouses...
        </p>
      ) : error ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>
            Failed to load warehouses: {error.message}
          </p>
          <button type="button" className="ds-btn-primary" onClick={refreshAll}>
            Try again
          </button>
        </div>
      ) : !data || data.length === 0 ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontWeight: 900 }}>No warehouses yet.</p>
          {canWrite ? (
            <p className="app-muted" style={{ marginTop: 8 }}>
              Create your first warehouse to populate this dashboard.
            </p>
          ) : null}
        </div>
      ) : filtered.length === 0 ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          No warehouses match your filters.
        </p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Warehouse ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Total Capacity</th>
                  <th>Occupancy Rate</th>
                  <th>Status</th>
                  <th className="ds-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((w) => {
                  const occ = occupancyPercent(w)
                  const tone = occ === null ? 'mid' : occupancyTone(occ)
                  const fillClass =
                    tone === 'low' ? 'ds-progress-fill--low' : tone === 'mid' ? 'ds-progress-fill--mid' : 'ds-progress-fill--high'
                  return (
                    <tr key={w.id}>
                      <td>
                        <Link className="ds-link-accent" to={`/warehouses/${w.id}`}>
                          {displayWarehouseCode(w)}
                        </Link>
                      </td>
                      <td>
                        <div className="ds-name-block">
                          <div className="ds-name-main">{w.name}</div>
                          <Link
                            className="ds-link-sub"
                            to={`/storage-locations?warehouseId=${w.id}`}
                          >
                            View storage locations
                          </Link>
                        </div>
                      </td>
                      <td>
                        <div className="ds-loc-row">
                          <span className="ds-pin" aria-hidden>
                            📍
                          </span>
                          <span>
                            {w.location}
                            {w.region ? (
                              <span style={{ color: 'rgba(15,23,42,0.45)' }}> ({w.region})</span>
                            ) : null}
                          </span>
                        </div>
                      </td>
                      <td>{formatM2(w.maxCapacityM2)}</td>
                      <td>
                        <div className="ds-progress-block">
                          {occ === null ? (
                            <span className="ds-progress-label">—</span>
                          ) : (
                            <>
                              <div className="ds-progress-track">
                                <div
                                  className={`ds-progress-fill ${fillClass}`}
                                  style={{ width: `${occ}%` }}
                                />
                              </div>
                              <span className="ds-progress-label">{occ.toFixed(0)}%</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={statusBadgeClass(w.status)}>{warehouseStatusLabel(w.status)}</span>
                      </td>
                      <td className="ds-table__col-actions">
                        <div className="ds-table-actions">
                          {canWrite ? (
                            <button
                              type="button"
                              className="ds-row-action"
                              title="Edit"
                              aria-label="Edit warehouse"
                              onClick={() => setEditTarget(w)}
                            >
                              <IconPencil />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="ds-row-action"
                            title="View on map"
                            aria-label="View on map"
                            onClick={() => openInMaps(w)}
                          >
                            <IconMap />
                          </button>
                          {canWrite ? (
                            <button
                              type="button"
                              className="ds-row-action ds-row-action--danger"
                              title="Delete"
                              aria-label="Delete warehouse"
                              onClick={() => setDeleteTarget(w)}
                            >
                              <IconTrash />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="ds-pagination">
            <div className="ds-pagination-summary">
              Showing {showingFrom}-{showingTo} of {filtered.length} warehouses
            </div>
            <div className="ds-pagination-buttons">
              <button
                type="button"
                className="ds-page-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ds-page-btn ${n === safePage ? 'ds-page-btn--active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="ds-page-btn"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {createOpen ? (
        <WarehouseFormModal
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSaved={() => refreshAll()}
        />
      ) : null}

      {editTarget ? (
        <WarehouseFormModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            refreshAll()
            setEditTarget(null)
          }}
        />
      ) : null}

      {deleteTarget ? (
        <WarehouseDeleteModal
          warehouse={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => refreshAll()}
        />
      ) : null}
    </div>
  )
}
