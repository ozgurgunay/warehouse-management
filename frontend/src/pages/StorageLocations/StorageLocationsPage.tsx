import { useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '../../auth/AuthContext'
import type { StorageLocation } from '../../features/storage-locations/types'
import { displayLocationCode, formatNullable } from '../../features/storage-locations/format'
import { useStorageLocations } from '../../features/storage-locations/hooks/useStorageLocations'
import { useStorageLocationStats } from '../../features/storage-locations/hooks/useStorageLocationStats'
import { useWarehouses } from '../../features/warehouses/hooks/useWarehouses'
import { warehouseLabel } from '../../features/warehouses/format'

import { StorageLocationDeleteModal } from './StorageLocationDeleteModal'
import { StorageLocationFormModal } from './StorageLocationFormModal'
import './storageLocationsPage.css'

const PAGE_SIZE = 8

function formatInt(n: number) {
  return n.toLocaleString('en-US')
}

function formatPct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`
}

function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function exportLocationsCsv(rows: StorageLocation[], filename: string) {
  const headers = [
    'warehouseId',
    'warehouseName',
    'locationCode',
    'name',
    'building',
    'floor',
    'section',
    'zoneLabel',
  ]
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        String(r.warehouseId),
        r.warehouseName ?? '',
        displayLocationCode(r),
        r.name,
        formatNullable(r.building),
        formatNullable(r.floor),
        formatNullable(r.section),
        formatNullable(r.zoneLabel),
      ]
        .map((c) => escapeCsvCell(c === '—' ? '' : c))
        .join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function IconGrid() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function IconClipboard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4h6l1 2h3v14H5V6h3l1-2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconFlame() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3s4 4 4 9c0 3-2 6-4 7-2-1-4-4-4-7 0-5 4-9 4-9Z"
        stroke="currentColor"
        strokeWidth="1.4"
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

function IconPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.83l-1.67-1.67a2 2 0 0 0-2.83 0L4 15.5V20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
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

export function StorageLocationsPage() {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('inventory.write')

  const { data: warehouses } = useWarehouses()
  const [scopeWarehouseId, setScopeWarehouseId] = useState<number | null>(null)
  const scopeInitialized = useRef(false)

  useEffect(() => {
    if (warehouses && warehouses.length > 0 && !scopeInitialized.current) {
      scopeInitialized.current = true
      setScopeWarehouseId(warehouses[0].id)
    }
  }, [warehouses])

  const { data, isLoading, error, refetch } = useStorageLocations(scopeWarehouseId)
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useStorageLocationStats(scopeWarehouseId)

  const [search, setSearch] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('')
  const [floorFilter, setFloorFilter] = useState('')
  const [sectionFilter, setSectionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<StorageLocation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StorageLocation | null>(null)

  const buildingOptions = useMemo(() => {
    if (!data) return []
    const s = new Set<string>()
    for (const r of data) {
      const b = r.building?.trim()
      if (b) s.add(b)
    }
    return [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [data])

  const floorOptions = useMemo(() => {
    if (!data) return []
    const s = new Set<string>()
    for (const r of data) {
      const f = r.floor?.trim()
      if (f) s.add(f)
    }
    return [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [data])

  const sectionOptions = useMemo(() => {
    if (!data) return []
    const s = new Set<string>()
    for (const r of data) {
      const x = r.section?.trim()
      if (x) s.add(x)
    }
    return [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data
      .filter((r) => {
        if (buildingFilter && (r.building?.trim() || '') !== buildingFilter) return false
        if (floorFilter && (r.floor?.trim() || '') !== floorFilter) return false
        if (sectionFilter && (r.section?.trim() || '') !== sectionFilter) return false
        if (!q) return true
        const hay = `${displayLocationCode(r)} ${r.name} ${r.warehouseName ?? ''} ${r.building ?? ''} ${r.floor ?? ''} ${r.section ?? ''}`
          .toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) =>
        displayLocationCode(a).localeCompare(displayLocationCode(b), undefined, {
          sensitivity: 'base',
        }),
      )
  }, [data, search, buildingFilter, floorFilter, sectionFilter])

  useEffect(() => {
    setPage(1)
  }, [search, buildingFilter, floorFilter, sectionFilter, data])

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

  const onExportCsv = () => {
    exportLocationsCsv(filtered, `storage-locations-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(filtered.length, safePage * PAGE_SIZE)

  const occupancyPct =
    stats && !statsError ? formatPct(stats.occupancyPercent) : '—'

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Inventory</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Storage locations</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">Storage locations</h1>
          <p className="sl-page-subtitle">
            Locations are scoped per warehouse. Pick a site to view KPIs and bins for that building.
          </p>
        </div>
        <div className="sl-toolbar-actions">
          <button type="button" className="ds-btn-ghost" onClick={onExportCsv}>
            Export CSV
          </button>
          {canWrite ? (
            <button type="button" className="ds-btn-primary" onClick={() => setCreateOpen(true)}>
              <span className="ds-btn-primary-icon" aria-hidden>
                +
              </span>
              New location
            </button>
          ) : null}
        </div>
      </div>

      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Total locations</div>
              <div className="ds-stat-value">
                {statsLoading ? '…' : statsError ? '—' : stats ? formatInt(stats.totalLocations) : '—'}
              </div>
              <div className="ds-stat-sub">All registered bins &amp; slots</div>
            </div>
            <div className="ds-stat-icon sl-stat-icon--blue" aria-hidden>
              <IconGrid />
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Occupied bins [{occupancyPct}]</div>
              <div className="ds-stat-value">
                {statsLoading ? '…' : statsError ? '—' : stats ? formatInt(stats.occupiedBins) : '—'}
              </div>
              <div className="ds-stat-sub">Locations with positive stock</div>
            </div>
            <div className="ds-stat-icon sl-stat-icon--slate" aria-hidden>
              <IconClipboard />
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Empty bins</div>
              <div className="ds-stat-value">
                {statsLoading ? '…' : statsError ? '—' : stats ? formatInt(stats.emptyBins) : '—'}
              </div>
              <div className="ds-stat-sub">No active quantity on hand</div>
            </div>
            <div className="ds-stat-icon sl-stat-icon--teal" aria-hidden>
              <IconCheckCircle />
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Hot zone</div>
              <div className="ds-stat-value" style={{ fontSize: 20 }}>
                {statsLoading ? '…' : statsError ? '—' : stats?.hotZoneLabel ?? '—'}
              </div>
              <div className="ds-stat-sub">Fast moving area (by zone label)</div>
            </div>
            <div className="ds-stat-icon sl-stat-icon--orange" aria-hidden>
              <IconFlame />
            </div>
          </div>
        </div>
      </div>

      <div className="ds-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
        <select
          className="ds-filter-select"
          aria-label="Warehouse scope"
          style={{ minWidth: 220 }}
          value={scopeWarehouseId ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setScopeWarehouseId(v === '' ? null : Number(v))
          }}
        >
          <option value="">All warehouses</option>
          {(warehouses ?? []).map((w) => (
            <option key={w.id} value={w.id}>
              {warehouseLabel(w)}
            </option>
          ))}
        </select>
        <div className="ds-search-wrap">
          <span className="ds-search-icon" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            className="ds-search-input"
            placeholder="Search by ID or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search storage locations"
          />
        </div>
        <select
          className="ds-filter-select"
          aria-label="Building filter"
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
        >
          <option value="">All buildings</option>
          {buildingOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          className="ds-filter-select"
          aria-label="Floor filter"
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
        >
          <option value="">All floors</option>
          {floorOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          className="ds-filter-select"
          aria-label="Section filter"
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
        >
          <option value="">All sections</option>
          {sectionOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
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
        <p className="app-muted" style={{ marginTop: 10 }}>
          Loading storage locations...
        </p>
      ) : error ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {error.message}</p>
          <button type="button" className="ds-btn-primary" onClick={refreshAll}>
            Try again
          </button>
        </div>
      ) : !data || data.length === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No storage locations yet.</p>
      ) : filtered.length === 0 ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          No rows match your filters.
        </p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Location ID</th>
                  {scopeWarehouseId == null ? <th>Warehouse</th> : null}
                  <th>Name</th>
                  <th>Building</th>
                  <th>Floor</th>
                  <th>Section</th>
                  <th className="ds-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span style={{ fontWeight: 900 }}>{displayLocationCode(r)}</span>
                    </td>
                    {scopeWarehouseId == null ? (
                      <td style={{ fontSize: 13 }}>{r.warehouseName ?? `WH #${r.warehouseId}`}</td>
                    ) : null}
                    <td style={{ fontWeight: 900 }}>{r.name}</td>
                    <td>{formatNullable(r.building)}</td>
                    <td>{formatNullable(r.floor)}</td>
                    <td>{formatNullable(r.section)}</td>
                    <td className="ds-table__col-actions">
                      <div className="ds-table-actions">
                        {canWrite ? (
                          <>
                            <button
                              type="button"
                              className="ds-row-action"
                              title="Edit"
                              aria-label="Edit"
                              onClick={() => setEditTarget(r)}
                            >
                              <IconPencil />
                            </button>
                            <button
                              type="button"
                              className="ds-row-action ds-row-action--danger"
                              title="Delete"
                              aria-label="Delete"
                              onClick={() => setDeleteTarget(r)}
                            >
                              <IconTrash />
                            </button>
                          </>
                        ) : (
                          <span className="app-muted" style={{ fontSize: 12 }}>
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ds-pagination">
            <div className="ds-pagination-summary">
              Showing {showingFrom}-{showingTo} of {formatInt(filtered.length)} locations
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
        <StorageLocationFormModal
          mode="create"
          defaultWarehouseId={scopeWarehouseId}
          onClose={() => setCreateOpen(false)}
          onSaved={() => refreshAll()}
        />
      ) : null}

      {editTarget ? (
        <StorageLocationFormModal
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
        <StorageLocationDeleteModal
          location={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => refreshAll()}
        />
      ) : null}
    </div>
  )
}
