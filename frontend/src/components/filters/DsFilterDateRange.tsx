/**
 * Toolbar date range: native date inputs aligned on one row with selects (labels beside inputs, not above).
 */

export type DsFilterDateRangeProps = {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  /** Short label beside first input (default: From) */
  fromLabel?: string
  /** Short label beside second input (default: To) */
  toLabel?: string
  /** Overrides aria-label on the first input when you need a longer description */
  fromAriaLabel?: string
  toAriaLabel?: string
  className?: string
}

export function DsFilterDateRange({
  from,
  to,
  onFromChange,
  onToChange,
  fromLabel = 'From',
  toLabel = 'To',
  fromAriaLabel,
  toAriaLabel,
  className,
}: DsFilterDateRangeProps) {
  return (
    <div
      className={['ds-filter-date-range', className].filter(Boolean).join(' ')}
      role="group"
      aria-label="Date range filter"
    >
      <div className="ds-filter-date-range__pair">
        <span className="ds-filter-date-range__inline-label">{fromLabel}</span>
        <input
          type="date"
          className="ds-filter-date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          aria-label={fromAriaLabel ?? fromLabel}
        />
      </div>
      <div className="ds-filter-date-range__pair">
        <span className="ds-filter-date-range__inline-label">{toLabel}</span>
        <input
          type="date"
          className="ds-filter-date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          aria-label={toAriaLabel ?? toLabel}
        />
      </div>
    </div>
  )
}
