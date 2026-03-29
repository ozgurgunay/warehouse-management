import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '../../auth/AuthContext'
import {
  createProduct,
  deleteProduct,
  getProductCatalog,
  getProductStats,
} from '../../features/products/api'
import { printProductLabel } from '../../features/products/printLabel'
import { parseProductImportCsv } from '../../features/products/csvImport'
import type { ProductDto } from '../../features/products/types'
import {
  categoryBadgeClass,
  formatCompactNumber,
  formatMoneyUsd,
  stockStatusDisplay,
} from '../../features/products/format'
import type { ProductCatalogRow, ProductStats } from '../../features/products/types'
import { useWarehouses } from '../../features/warehouses/hooks/useWarehouses'
import { warehouseLabel } from '../../features/warehouses/format'
import { isAbortError, type ApiError } from '../../services/apiClient'
import { DsFilterDateRange } from '../../components/filters/DsFilterDateRange'

import { ProductDeleteConfirmModal } from './ProductDeleteConfirmModal'
import { ProductDetailModal } from './ProductDetailModal'
import { ProductFormModal } from './ProductFormModal'
import './productsCatalog.css'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

type ColumnKey = 'sku' | 'details' | 'stock' | 'price' | 'audit' | 'actions'

const DEFAULT_COLUMNS: Record<ColumnKey, boolean> = {
  sku: true,
  details: true,
  stock: true,
  price: true,
  audit: true,
  actions: true,
}

function stockBarPercent(row: ProductCatalogRow) {
  const thr = row.lowStockThreshold ?? 10
  const cap = Math.max(100, thr * 15, row.totalAvailableUnits * 2)
  return Math.min(100, (row.totalAvailableUnits / cap) * 100)
}

function exportCatalogCsv(rows: ProductCatalogRow[], filename: string) {
  const headers = [
    'sku',
    'name',
    'category',
    'price',
    'availableUnits',
    'stockStatus',
    'primaryLocation',
    'updatedBy',
    'updatedAt',
  ]
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.sku,
        r.name,
        r.categoryName ?? '',
        r.price ?? '',
        r.totalAvailableUnits,
        r.stockStatus,
        r.primaryLocationLabel ?? '',
        r.updatedBy,
        r.updatedAt ?? '',
      ]
        .map((c) => {
          const s = String(c)
          if (s.includes('"') || s.includes(',') || s.includes('\n')) {
            return `"${s.replace(/"/g, '""')}"`
          }
          return s
        })
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

function IconBarcode() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h2v12H4V6zm4 0h1v12H8V6zm3 0h3v12h-3V6zm5 0h1v12h-1V6zm3 0h2v12h-2V6z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconQr() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4zm9 0h7v4h-7V4zm0 6h7v10h-7V10zM4 13h7v7H4v-7z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
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

function IconPrint() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 6V4h10v2M7 18h10v2H7v-2zm-3-4h16v8H4v-8zm3-6h10v2H7v-2z"
        stroke="currentColor"
        strokeWidth="1.4"
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

export function ProductsCatalogPage() {
  const { hasCapability, currentUser } = useAuth()
  const canWrite = hasCapability('inventory.write')
  const auditUser = currentUser?.username ?? 'system'
  const { data: warehouses } = useWarehouses()

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(25)
  const [search, setSearch] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [warehouseId, setWarehouseId] = useState<number | null>(null)
  const [stockStatus, setStockStatus] = useState<string>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [stats, setStats] = useState<ProductStats | null>(null)
  const [statsError, setStatsError] = useState<ApiError | null>(null)

  const [catalog, setCatalog] = useState<{
    rows: ProductCatalogRow[]
    totalElements: number
    totalPages: number
  } | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<ApiError | null>(null)

  const [selected, setSelected] = useState<Set<number>>(() => new Set())
  const [detailId, setDetailId] = useState<number | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [formEditId, setFormEditId] = useState<number | null>(null)
  const [deleteIds, setDeleteIds] = useState<number[] | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKey, boolean>>(() => ({
    ...DEFAULT_COLUMNS,
  }))
  const [bulkAction, setBulkAction] = useState('')
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const fetchStats = useCallback(() => {
    getProductStats()
      .then(setStats)
      .catch((e: unknown) => setStatsError(e as ApiError))
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    let isCurrent = true
    const controller = new AbortController()
    setCatalogLoading(true)
    setCatalogError(null)
    getProductCatalog(
      {
        page,
        size,
        search: search.trim() || undefined,
        warehouseId,
        stockStatus: stockStatus === 'ALL' ? null : stockStatus,
        updatedFrom: dateFrom || undefined,
        updatedTo: dateTo || undefined,
      },
      controller.signal,
    )
      .then((res) => {
        if (!isCurrent) return
        setCatalog({
          rows: res.content,
          totalElements: res.totalElements,
          totalPages: res.totalPages,
        })
      })
      .catch((e: unknown) => {
        if (!isCurrent) return
        if (isAbortError(e)) return
        setCatalogError(e as ApiError)
        setCatalog(null)
      })
      .finally(() => {
        if (isCurrent) setCatalogLoading(false)
      })
    return () => {
      isCurrent = false
      controller.abort()
    }
  }, [page, size, search, warehouseId, stockStatus, dateFrom, dateTo, reloadTick])

  const refreshAll = useCallback(() => {
    setReloadTick((x) => x + 1)
    fetchStats()
  }, [fetchStats])

  const onApplyFilters = () => {
    setSearch(searchDraft)
    setPage(0)
  }

  const runBulkDelete = async () => {
    if (!deleteIds?.length) return
    try {
      setBulkDeleting(true)
      for (const id of deleteIds) {
        await deleteProduct(id)
      }
      setSelected(new Set())
      setDeleteIds(null)
      refreshAll()
    } catch (e: unknown) {
      window.alert((e as ApiError).message ?? 'Delete failed')
    } finally {
      setBulkDeleting(false)
    }
  }

  const onImportCsv = async (file: File) => {
    const text = await file.text()
    const { rows, errors } = parseProductImportCsv(text)
    if (errors.length && rows.length === 0) {
      window.alert(errors.join('\n'))
      return
    }
    setImporting(true)
    let ok = 0
    const fail: string[] = []
    for (const r of rows) {
      const body: ProductDto = {
        name: r.name,
        sku: r.sku,
        price: r.price,
        description: r.description,
        categoryId: r.categoryId,
        manufacturer: r.manufacturer,
        dimensionsText: r.dimensionsText,
        weightKg: r.weightKg,
        material: r.material,
        operatingTempRange: r.operatingTempRange,
        ipRating: r.ipRating,
        imageUrl: r.imageUrl,
        lowStockThreshold: r.lowStockThreshold,
        createdBy: auditUser,
        updatedBy: auditUser,
      }
      try {
        await createProduct(body)
        ok++
      } catch (e: unknown) {
        fail.push(`${r.sku}: ${(e as ApiError).message}`)
      }
    }
    setImporting(false)
    if (errors.length) fail.push(...errors.map((e) => `Parse: ${e}`))
    window.alert(
      `Imported ${ok} product(s).${fail.length ? `\n\nFailed (${fail.length}):\n${fail.slice(0, 8).join('\n')}` : ''}`,
    )
    refreshAll()
  }

  const allRowsSelected = useMemo(() => {
    if (!catalog?.rows.length) return false
    return catalog.rows.every((r) => selected.has(r.id))
  }, [catalog, selected])

  const toggleAll = () => {
    if (!catalog?.rows.length) return
    if (allRowsSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(catalog.rows.map((r) => r.id)))
    }
  }

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const subtitle = stats
    ? `NODE ALPHA MASTER REPOSITORY • ${stats.totalSku.toLocaleString('en-US')} TOTAL RECORDS`
    : 'Browse SKU, stock levels, and audit trail.'

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Inventory</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Products</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">PRODUCTS CATALOG</h1>
          <p className="pc-page-subtitle">{subtitle}</p>
        </div>
        <div className="sl-toolbar-actions">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) void onImportCsv(f)
            }}
          />
          <button
            type="button"
            className="ds-btn-ghost"
            disabled={!canWrite || importing}
            onClick={() => importInputRef.current?.click()}
          >
            {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            disabled={!canWrite}
            onClick={() => {
              setFormMode('create')
              setFormEditId(null)
            }}
          >
            <span className="ds-btn-primary-icon" aria-hidden>
              +
            </span>
            Create product
          </button>
        </div>
      </div>

      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Total SKU</div>
              <div className="ds-stat-value">
                {stats ? stats.totalSku.toLocaleString('en-US') : '—'}
              </div>
              <div className="pc-stat-trend">+1.2% trend</div>
            </div>
            <div className="ds-stat-icon sl-stat-icon--blue" aria-hidden>
              #
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Avg unit price</div>
              <div className="ds-stat-value">
                {stats ? formatMoneyUsd(stats.averageUnitPrice) : '—'}
              </div>
              <div className="pc-stat-trend--muted">USD</div>
            </div>
            <div className="ds-stat-icon sl-stat-icon--slate" aria-hidden>
              $
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Total value</div>
              <div className="ds-stat-value">
                {stats ? `$${formatCompactNumber(stats.totalInventoryValue)}` : '—'}
              </div>
              <div className="pc-stat-trend--muted">Live</div>
            </div>
            <div className="ds-stat-icon sl-stat-icon--teal" aria-hidden>
              ∑
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Low stock SKU</div>
              <div className="ds-stat-value">
                {stats ? stats.lowStockSkuCount.toLocaleString('en-US') : '—'}
              </div>
              <div className="pc-stat-pill">Critical</div>
            </div>
            <div className="ds-stat-icon sl-stat-icon--orange" aria-hidden>
              !
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Recently sync</div>
              <div className="ds-stat-value">
                {stats ? stats.recentlyUpdatedCount.toLocaleString('en-US') : '—'}
              </div>
              <div className="pc-stat-pill--new">New</div>
            </div>
            <div className="ds-stat-icon sl-stat-icon--blue" aria-hidden>
              ↻
            </div>
          </div>
        </div>
      </div>
      {statsError ? (
        <p style={{ color: '#dc2626', fontWeight: 800, marginTop: 8 }}>{statsError.message}</p>
      ) : null}

      <div className="ds-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="ds-search-wrap" style={{ flex: '1 1 260px' }}>
          <span className="ds-search-icon" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            className="ds-search-input"
            placeholder="Search by SKU, product name or description..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onApplyFilters()}
            aria-label="Search products"
          />
        </div>
        <select
          className="ds-filter-select"
          aria-label="Warehouse"
          value={warehouseId ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setWarehouseId(v === '' ? null : Number(v))
            setPage(0)
          }}
        >
          <option value="">All warehouses</option>
          {(warehouses ?? []).map((w) => (
            <option key={w.id} value={w.id}>
              {warehouseLabel(w)}
            </option>
          ))}
        </select>
        <select
          className="ds-filter-select"
          aria-label="Stock status"
          value={stockStatus}
          onChange={(e) => {
            setStockStatus(e.target.value)
            setPage(0)
          }}
        >
          <option value="ALL">Stock status</option>
          <option value="IN_STOCK">In stock</option>
          <option value="LOW_STOCK">Low stock</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
        </select>
        <DsFilterDateRange
          from={dateFrom}
          to={dateTo}
          onFromChange={(v) => {
            setDateFrom(v)
            setPage(0)
          }}
          onToChange={(v) => {
            setDateTo(v)
            setPage(0)
          }}
          fromLabel="From"
          toLabel="To"
          fromAriaLabel="Updated from"
          toAriaLabel="Updated to"
        />
        <button type="button" className="ds-btn-primary" onClick={onApplyFilters}>
          Apply
        </button>
      </div>

      <div className="pc-bulk-row">
        <select
          className="ds-filter-select"
          aria-label="Bulk action"
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
        >
          <option value="">Select action…</option>
          {canWrite ? <option value="delete">Delete selected</option> : null}
        </select>
        <button
          type="button"
          className="ds-btn-primary"
          disabled={!canWrite || !bulkAction || bulkAction !== 'delete' || selected.size === 0}
          onClick={() => {
            if (bulkAction === 'delete' && selected.size > 0) {
              setDeleteIds(Array.from(selected))
            }
          }}
        >
          Run
        </button>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ds-muted)' }}>
          {selected.size} items selected
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={() => catalog && exportCatalogCsv(catalog.rows, `products-${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={!catalog?.rows.length}
          >
            Export all
          </button>
          <div style={{ position: 'relative' }}>
            <button type="button" className="ds-btn-ghost" onClick={() => setColumnsOpen((v) => !v)}>
              Columns
            </button>
            {columnsOpen ? (
              <div
                className="pc-columns-pop"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 6,
                  zIndex: 20,
                  background: '#fff',
                  border: '1px solid var(--ds-border)',
                  borderRadius: 12,
                  padding: 12,
                  minWidth: 200,
                  boxShadow: '0 12px 40px rgba(2,6,23,0.12)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 900, marginBottom: 8, color: 'var(--ds-muted)' }}>VISIBLE</div>
                {(Object.keys(DEFAULT_COLUMNS) as ColumnKey[]).map((key) => (
                  <label
                    key={key}
                    style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 13, fontWeight: 700 }}
                  >
                    <input
                      type="checkbox"
                      checked={columnVisibility[key]}
                      onChange={(e) =>
                        setColumnVisibility((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                    />
                    {key}
                  </label>
                ))}
                <button type="button" className="ds-btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => setColumnsOpen(false)}>
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {catalogLoading ? (
        <p className="app-muted" style={{ marginTop: 10 }}>
          Loading products…
        </p>
      ) : catalogError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {catalogError.message}</p>
          <button type="button" className="ds-btn-primary" onClick={() => setReloadTick((x) => x + 1)}>
            Retry
          </button>
        </div>
      ) : !catalog || catalog.rows.length === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No products match your filters.</p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input
                      type="checkbox"
                      checked={allRowsSelected}
                      onChange={toggleAll}
                      aria-label="Select all on page"
                    />
                  </th>
                  {columnVisibility.sku ? <th>SKU &amp; code</th> : null}
                  {columnVisibility.details ? <th>Product details</th> : null}
                  {columnVisibility.stock ? <th>Stock distribution</th> : null}
                  {columnVisibility.price ? <th>Unit price</th> : null}
                  {columnVisibility.audit ? <th>Audit trail</th> : null}
                  {columnVisibility.actions ? <th className="ds-table__col-actions">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {catalog.rows.map((row) => {
                  const st = stockStatusDisplay(row.stockStatus)
                  const barPct = stockBarPercent(row)
                  const fillClass =
                    st.tone === 'ok'
                      ? 'pc-stock-bar-fill--ok'
                      : st.tone === 'warn'
                        ? 'pc-stock-bar-fill--warn'
                        : 'pc-stock-bar-fill--bad'
                  const labelClass =
                    st.tone === 'ok'
                      ? 'pc-stock-label--ok'
                      : st.tone === 'warn'
                        ? 'pc-stock-label--warn'
                        : 'pc-stock-label--bad'
                  return (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggleOne(row.id)}
                          aria-label={`Select ${row.sku}`}
                        />
                      </td>
                      {columnVisibility.sku ? (
                        <td>
                          <div className="pc-sku-cell">
                            <span className="pc-sku-main">{row.sku}</span>
                            <div className="pc-sku-icons">
                              <span className="pc-icon-btn" title="Barcode">
                                <IconBarcode />
                              </span>
                              <span className="pc-icon-btn" title="QR code">
                                <IconQr />
                              </span>
                            </div>
                          </div>
                        </td>
                      ) : null}
                      {columnVisibility.details ? (
                        <td>
                          <div style={{ fontWeight: 900 }}>{row.name}</div>
                          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            <span className={categoryBadgeClass(row.categoryName ?? undefined)}>
                              {(row.categoryName ?? 'UNCATEGORIZED').toUpperCase()}
                            </span>
                            {row.primaryLocationLabel ? (
                              <span className="pc-loc-badge" title={row.primaryLocationLabel}>
                                {row.primaryLocationLabel}
                              </span>
                            ) : (
                              <span className="pc-loc-badge">NO STORAGE</span>
                            )}
                          </div>
                        </td>
                      ) : null}
                      {columnVisibility.stock ? (
                        <td>
                          <div className="pc-stock-block">
                            <div>
                              <span className="pc-stock-units">
                                {row.totalAvailableUnits.toLocaleString('en-US')} units
                              </span>{' '}
                              <span className={`pc-stock-label ${labelClass}`}>{st.label}</span>
                            </div>
                            <div className="pc-stock-bar">
                              <div
                                className={`pc-stock-bar-fill ${fillClass}`}
                                style={{ width: `${barPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      ) : null}
                      {columnVisibility.price ? (
                        <td style={{ fontWeight: 900 }}>{formatMoneyUsd(row.price)}</td>
                      ) : null}
                      {columnVisibility.audit ? (
                        <td>
                          <div className="pc-audit">{row.updatedBy}</div>
                          <time className="pc-audit">
                            {row.updatedAt
                              ? new Date(row.updatedAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </time>
                        </td>
                      ) : null}
                      {columnVisibility.actions ? (
                        <td className="ds-table__col-actions">
                          <div className="ds-table-actions">
                            <button
                              type="button"
                              className="ds-row-action"
                              title="View"
                              aria-label="View product"
                              onClick={() => setDetailId(row.id)}
                            >
                              <IconEye />
                            </button>
                            <button
                              type="button"
                              className="ds-row-action"
                              disabled={!canWrite}
                              title="Edit"
                              aria-label="Edit product"
                              onClick={() => {
                                setFormEditId(row.id)
                                setFormMode('edit')
                              }}
                            >
                              <IconPencil />
                            </button>
                            <button
                              type="button"
                              className="ds-row-action"
                              title="Print label"
                              aria-label="Print product label"
                              onClick={() => printProductLabel({ sku: row.sku, name: row.name })}
                            >
                              <IconPrint />
                            </button>
                            <button
                              type="button"
                              className="ds-row-action ds-row-action--danger"
                              disabled={!canWrite}
                              title="Delete"
                              aria-label="Delete product"
                              onClick={() => setDeleteIds([row.id])}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="ds-pagination">
            <div className="ds-pagination-summary">
              Page {page + 1} of {Math.max(1, catalog.totalPages)} ·{' '}
              <select
                className="ds-filter-select"
                aria-label="Page size"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value))
                  setPage(0)
                }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} per page
                  </option>
                ))}
              </select>
            </div>
            <div className="ds-pagination-buttons">
              <button
                type="button"
                className="ds-page-btn"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </button>
              {Array.from({ length: Math.max(1, catalog.totalPages) }, (_, i) => i).map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`ds-page-btn ${i === page ? 'ds-page-btn--active' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className="ds-page-btn"
                disabled={catalog.totalPages <= 1 || page >= catalog.totalPages - 1}
                onClick={() => setPage((p) => Math.min(Math.max(0, catalog.totalPages - 1), p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {detailId != null ? (
        <ProductDetailModal
          productId={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(id) => {
            setDetailId(null)
            setFormEditId(id)
            setFormMode('edit')
          }}
          onDeleted={refreshAll}
          canWrite={canWrite}
        />
      ) : null}

      {formMode ? (
        <ProductFormModal
          mode={formMode}
          productId={formEditId ?? undefined}
          onClose={() => {
            setFormMode(null)
            setFormEditId(null)
          }}
          onSaved={refreshAll}
        />
      ) : null}

      {deleteIds != null ? (
        <ProductDeleteConfirmModal
          title={deleteIds.length > 1 ? 'Delete products' : 'Delete product'}
          message={`Delete ${deleteIds.length} product(s)? Inventory or order references may block deletion.`}
          onConfirm={() => void runBulkDelete()}
          onClose={() => setDeleteIds(null)}
          isDeleting={bulkDeleting}
        />
      ) : null}
    </div>
  )
}
