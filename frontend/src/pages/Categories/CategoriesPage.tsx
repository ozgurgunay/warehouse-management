import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../auth/AuthContext'
import {
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../features/categories/api'
import {
  categoryCountPillClass,
  categoryNameAccentClass,
  formatCategoryCode,
} from '../../features/categories/format'
import type { Category, CategoryStatus } from '../../features/categories/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import { CategoryDeleteConfirmModal } from './CategoryDeleteConfirmModal'
import { CategoryFormModal } from './CategoryFormModal'
import { CategoryViewModal } from './CategoryViewModal'
import './categoriesPage.css'

const PAGE_SIZE = 8

type SortKey = 'name' | 'productCount' | 'createdAt'

function parseDate(iso: string | null | undefined): number {
  if (!iso) return 0
  const t = Date.parse(iso)
  return Number.isNaN(t) ? 0 : t
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function IconPrint() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M6 10V4h12v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function CategoriesPage() {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('inventory.write')

  const [rows, setRows] = useState<Category[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | CategoryStatus>('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<number>>(() => new Set())

  const [bulkAction, setBulkAction] = useState<'none' | 'archive' | 'delete'>('none')
  const [bulkWorking, setBulkWorking] = useState(false)

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [viewCategory, setViewCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [deleteWorking, setDeleteWorking] = useState(false)

  const refresh = useCallback(() => setReloadTick((x) => x + 1), [])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    getCategories(ac.signal)
      .then((data) => {
        if (!isCurrent) return
        setRows(data)
      })
      .catch((e) => {
        if (!isCurrent) return
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [reloadTick])

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = search.trim().toLowerCase()
    let list = rows.filter((c) => {
      if (statusFilter !== 'ALL' && (c.status ?? 'ACTIVE') !== statusFilter) return false
      if (!q) return true
      const hay = `${c.name} ${c.description ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
    list = [...list].sort((a, b) => {
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      }
      if (sortKey === 'productCount') {
        return (b.productCount ?? 0) - (a.productCount ?? 0)
      }
      return parseDate(b.createdAt) - parseDate(a.createdAt)
    })
    return list
  }, [rows, search, statusFilter, sortKey])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, sortKey, rows?.length])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const stats = useMemo(() => {
    if (!rows || rows.length === 0) {
      return {
        total: 0,
        active: 0,
        activePct: 0,
        avgProducts: 0,
        addedThisMonth: 0,
        recent: null as Category | null,
      }
    }
    const total = rows.length
    const active = rows.filter((c) => (c.status ?? 'ACTIVE') === 'ACTIVE').length
    const activePct = total > 0 ? Math.round((active / total) * 1000) / 10 : 0
    const sumCount = rows.reduce((s, c) => s + (c.productCount ?? 0), 0)
    const avgProducts = total > 0 ? Math.round((sumCount / total) * 10) / 10 : 0
    const monthStart = startOfMonth(new Date()).getTime()
    const addedThisMonth = rows.filter((c) => parseDate(c.createdAt) >= monthStart).length
    const sortedByDate = [...rows].sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt))
    const recent = sortedByDate[0] ?? null
    return { total, active, activePct, avgProducts, addedThisMonth, recent }
  }, [rows])

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllPage = () => {
    const ids = paged.map((c) => c.id)
    const allOnPage = ids.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allOnPage) {
        ids.forEach((id) => next.delete(id))
      } else {
        ids.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const exportCsv = () => {
    const header = ['id', 'code', 'name', 'status', 'description', 'productCount']
    const lines = [
      header.join(','),
      ...filtered.map((c) =>
        [
          c.id,
          formatCategoryCode(c.id),
          csvEscape(c.name),
          c.status ?? 'ACTIVE',
          csvEscape(c.description ?? ''),
          c.productCount ?? 0,
        ].join(','),
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `categories-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const runBulkArchive = async () => {
    const ids = [...selected]
    if (ids.length === 0) return
    setBulkWorking(true)
    try {
      for (const id of ids) {
        const c = rows?.find((r) => r.id === id)
        if (!c) continue
        await updateCategory(id, {
          name: c.name,
          description: c.description,
          status: 'ARCHIVED',
        })
      }
      setSelected(new Set())
      setBulkAction('none')
      refresh()
    } catch (e) {
      window.alert((e as ApiError).message)
    } finally {
      setBulkWorking(false)
    }
  }

  const runBulkDelete = async () => {
    const ids = [...selected]
    const blocked = ids.filter((id) => (rows?.find((r) => r.id === id)?.productCount ?? 0) > 0)
    if (blocked.length > 0) {
      window.alert('Cannot delete categories that still have products assigned.')
      return
    }
    setBulkWorking(true)
    try {
      for (const id of ids) {
        await deleteCategory(id)
      }
      setSelected(new Set())
      setBulkAction('none')
      setBulkDeleteConfirm(false)
      refresh()
    } catch (e) {
      window.alert((e as ApiError).message)
    } finally {
      setBulkWorking(false)
    }
  }

  const onPrint = () => window.print()

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(filtered.length, safePage * PAGE_SIZE)

  const allSelectedOnPage = paged.length > 0 && paged.every((c) => selected.has(c.id))

  return (
    <div className="ds-page cat-print-root">
      <nav className="ds-breadcrumb cat-hide-print" aria-label="Breadcrumb">
        <span>Inventory</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Categories</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">CATEGORIES MANAGEMENT</h1>
          <p className="cat-page-subtitle">Manage product categories and their descriptions.</p>
        </div>
        {canWrite ? (
          <button
            type="button"
            className="ds-btn-primary"
            onClick={() => {
              setEditId(null)
              setFormMode('create')
            }}
          >
            <span className="ds-btn-primary-icon" aria-hidden>
              +
            </span>
            Add New Category
          </button>
        ) : null}
      </div>

      <div className="cat-stat-grid">
        <div className="cat-stat-card cat-stat-card--teal">
          <div className="cat-stat-label">Total categories</div>
          <div className="cat-stat-value">{loading ? '…' : stats.total}</div>
          <div className="cat-stat-meta cat-stat-meta--success">
            {stats.addedThisMonth > 0 ? `+${stats.addedThisMonth} this month` : 'No new this month'}
          </div>
        </div>
        <div className="cat-stat-card cat-stat-card--teal">
          <div className="cat-stat-label">Active categories</div>
          <div className="cat-stat-value">{loading ? '…' : stats.active}</div>
          <div className="cat-stat-meta">{stats.total > 0 ? `${stats.activePct}% active` : '—'}</div>
        </div>
        <div className="cat-stat-card cat-stat-card--amber">
          <div className="cat-stat-label">Avg products per cat</div>
          <div className="cat-stat-value">{loading ? '…' : stats.avgProducts}</div>
          <div className="cat-stat-meta">Across all categories</div>
        </div>
        <div className="cat-stat-card cat-stat-card--muted">
          <div className="cat-stat-label">Recently added</div>
          <div className="cat-stat-value" style={{ fontSize: 16, lineHeight: 1.25 }}>
            {loading ? '…' : stats.recent?.name ?? '—'}
          </div>
          <div className="cat-stat-meta">
            {stats.recent?.createdAt
              ? new Date(stats.recent.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
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
            placeholder="Filter by category name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter categories"
          />
        </div>
        <select
          className="ds-filter-select"
          aria-label="Status filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | CategoryStatus)}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        {canWrite ? (
          <>
            <select
              className="ds-filter-select"
              aria-label="Bulk actions"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value as 'none' | 'archive' | 'delete')}
            >
              <option value="none">Bulk actions</option>
              <option value="archive">Archive selected</option>
              <option value="delete">Delete selected</option>
            </select>
            <button
              type="button"
              className="ds-btn-ghost"
              disabled={bulkAction === 'none' || selected.size === 0 || bulkWorking}
              onClick={() => {
                if (bulkAction === 'archive') void runBulkArchive()
                if (bulkAction === 'delete') setBulkDeleteConfirm(true)
              }}
            >
              {bulkWorking ? 'Running…' : 'Run'}
            </button>
          </>
        ) : null}
        <div className="cat-toolbar-print cat-hide-print" style={{ marginLeft: 'auto' }}>
          <select
            className="ds-filter-select"
            aria-label="Sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="name">Sort by name</option>
            <option value="productCount">Sort by product count</option>
            <option value="createdAt">Sort by date added</option>
          </select>
          <button type="button" className="ds-icon-button" aria-label="Print table" onClick={onPrint}>
            <IconPrint />
          </button>
          <button type="button" className="ds-btn-ghost" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p className="app-muted" style={{ marginTop: 8 }}>
          Loading categories…
        </p>
      ) : loadError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {loadError}</p>
          <button type="button" className="ds-btn-primary" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : !rows || rows.length === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No categories yet.</p>
      ) : filtered.length === 0 ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          No categories match your filters.
        </p>
      ) : (
        <>
          <div className="cat-table-wrap">
            <table className="cat-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    {canWrite ? (
                      <input
                        type="checkbox"
                        checked={allSelectedOnPage}
                        onChange={toggleSelectAllPage}
                        aria-label="Select all on this page"
                      />
                    ) : null}
                  </th>
                  <th>ID</th>
                  <th>Category name</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Product count</th>
                  <th className="ds-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((c) => {
                  const st = c.status ?? 'ACTIVE'
                  const accent = categoryNameAccentClass(c.id)
                  return (
                    <tr key={c.id}>
                      <td>
                        {canWrite ? (
                          <input
                            type="checkbox"
                            checked={selected.has(c.id)}
                            onChange={() => toggleSelect(c.id)}
                            aria-label={`Select ${c.name}`}
                          />
                        ) : null}
                      </td>
                      <td style={{ fontWeight: 900, color: '#2563eb' }}>{formatCategoryCode(c.id)}</td>
                      <td>
                        <div className="cat-name-cell">
                          <span className={`cat-name-accent ${accent}`} aria-hidden />
                          <span className="cat-name-main">{c.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="cat-status-pill">
                          <span
                            className={`cat-status-dot ${st === 'ACTIVE' ? 'cat-status-dot--active' : 'cat-status-dot--archived'}`}
                          />
                          {st}
                        </span>
                      </td>
                      <td>
                        <div className="cat-desc-cell">{c.description?.trim() ? c.description : '—'}</div>
                      </td>
                      <td>
                        <span className={categoryCountPillClass(c.productCount ?? 0)}>
                          {c.productCount ?? 0}
                        </span>
                      </td>
                      <td className="ds-table__col-actions">
                        <div className="ds-table-actions">
                          <button
                            type="button"
                            className="ds-row-action"
                            aria-label={`View ${c.name}`}
                            onClick={() => setViewCategory(c)}
                          >
                            <IconEye />
                          </button>
                          {canWrite ? (
                            <button
                              type="button"
                              className="ds-row-action"
                              aria-label={`Edit ${c.name}`}
                              onClick={() => {
                                setEditId(c.id)
                                setFormMode('edit')
                              }}
                            >
                              <IconPencil />
                            </button>
                          ) : null}
                          {canWrite ? (
                            <button
                              type="button"
                              className="ds-row-action ds-row-action--danger"
                              aria-label={`Delete ${c.name}`}
                              disabled={(c.productCount ?? 0) > 0}
                              title={
                                (c.productCount ?? 0) > 0
                                  ? 'Remove products from this category first'
                                  : 'Delete'
                              }
                              onClick={() => setDeleteTarget(c)}
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
              Showing {showingFrom}-{showingTo} of {filtered.length} categories
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

      {viewCategory ? (
        <CategoryViewModal category={viewCategory} onClose={() => setViewCategory(null)} />
      ) : null}

      {formMode ? (
        <CategoryFormModal
          mode={formMode}
          categoryId={editId ?? undefined}
          onClose={() => {
            setFormMode(null)
            setEditId(null)
          }}
          onSaved={refresh}
        />
      ) : null}

      {deleteTarget ? (
        <CategoryDeleteConfirmModal
          title="Delete category"
          message={`Delete “${deleteTarget.name}”? This cannot be undone.`}
          isDeleting={deleteWorking}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            setDeleteWorking(true)
            deleteCategory(deleteTarget.id)
              .then(() => {
                setDeleteTarget(null)
                refresh()
              })
              .catch((e) => window.alert((e as ApiError).message))
              .finally(() => setDeleteWorking(false))
          }}
        />
      ) : null}

      {bulkDeleteConfirm ? (
        <CategoryDeleteConfirmModal
          title="Delete categories"
          message={`Delete ${selected.size} categor${selected.size === 1 ? 'y' : 'ies'}? Categories with products cannot be removed.`}
          isDeleting={bulkWorking}
          onClose={() => setBulkDeleteConfirm(false)}
          onConfirm={() => void runBulkDelete()}
        />
      ) : null}
    </div>
  )
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}
