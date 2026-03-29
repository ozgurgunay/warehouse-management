/**
 * Opens a minimal print dialog with SKU and product name (and optional barcode text).
 * Variables and comments in English per project convention.
 */
export function printProductLabel(payload: {
  sku: string
  name: string
  barcodeText?: string | null
  qrText?: string | null
}) {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const lines = [
    `<div style="font-family:system-ui,Segoe UI,sans-serif;padding:16px;max-width:320px;">`,
    `<div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:#64748b;">WAREHOUSE LABEL</div>`,
    `<div style="font-size:20px;font-weight:900;margin-top:8px;">${escape(payload.sku)}</div>`,
    `<div style="font-size:14px;font-weight:700;margin-top:6px;color:#0f172a;">${escape(payload.name)}</div>`,
  ]
  if (payload.barcodeText) {
    lines.push(
      `<div style="margin-top:12px;font-size:12px;font-weight:800;letter-spacing:.2em;">${escape(payload.barcodeText)}</div>`,
    )
  }
  if (payload.qrText) {
    lines.push(`<div style="margin-top:8px;font-size:11px;color:#64748b;">QR: ${escape(payload.qrText)}</div>`)
  }
  lines.push(`</div>`)

  const w = window.open('', '_blank', 'width=400,height=360')
  if (!w) {
    window.alert('Allow pop-ups to print labels.')
    return
  }
  w.document.write(
    `<!DOCTYPE html><html><head><title>Label ${escape(payload.sku)}</title></head><body>${lines.join('')}<script>window.onload=function(){window.print();}</script></body></html>`,
  )
  w.document.close()
}
