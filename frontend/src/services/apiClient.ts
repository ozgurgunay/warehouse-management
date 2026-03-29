export type ApiError = {
  status: number
  message: string
  details?: unknown
}

/** True when fetch was aborted (navigation, modal close, React Strict Mode re-run). Not an application error. */
export function isAbortError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === 'AbortError') return true
  if (typeof e === 'object' && e !== null && 'name' in e && (e as { name: string }).name === 'AbortError') {
    return true
  }
  return false
}

type AuthHeaderProvider = () => string | null

let authHeaderProvider: AuthHeaderProvider | null = null

export function setAuthHeaderProvider(provider: AuthHeaderProvider | null) {
  authHeaderProvider = provider
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  query?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions['query'],
) {
  const base = baseUrl.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base}${p}`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function resolveApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (env !== undefined && env !== '') return env
  // Dev: same-origin /api + Vite proxy → backend (avoids CORS / "Failed to fetch" when backend is on :8080)
  if (import.meta.env.DEV) {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://localhost:5173'
    return `${origin}/api`
  }
  return 'http://localhost:8080'
}

function parseJsonFromText(text: string): unknown {
  const trimmed = text.trim()
  if (!trimmed) return undefined
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    return undefined
  }
}

function extractErrorMessage(details: unknown, status: number): string {
  if (typeof details === 'object' && details !== null) {
    const d = details as Record<string, unknown>
    if (typeof d.message === 'string' && d.message.trim()) {
      return d.message
    }
    if (typeof d.error === 'string' && d.error.trim()) {
      return d.error
    }
    const ve = d.validationErrors
    if (ve && typeof ve === 'object') {
      const values = Object.values(ve as Record<string, unknown>).filter(
        (v) => typeof v === 'string' && (v as string).trim(),
      ) as string[]
      if (values.length > 0) {
        return values[0]
      }
    }
  }
  if (typeof details === 'string' && details.trim()) {
    return details
  }
  return `Request failed (${status})`
}

export async function apiRequest<T>(options: RequestOptions): Promise<T> {
  const baseUrl = resolveApiBaseUrl()

  const url = buildUrl(baseUrl, options.path, options.query)
  const method = options.method ?? 'GET'
  const authHeaderValue = authHeaderProvider ? authHeaderProvider() : null

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(options.body ? { 'content-type': 'application/json' } : undefined),
        ...(authHeaderValue ? { authorization: authHeaderValue } : undefined),
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      credentials: 'include',
    })
  } catch (e: unknown) {
    if (isAbortError(e)) throw e
    const isNetwork =
      e instanceof TypeError ||
      (typeof e === 'object' &&
        e !== null &&
        'name' in e &&
        (e as { name: string }).name === 'TypeError')
    const msg =
      isNetwork && e instanceof Error
        ? `Cannot reach the API at ${baseUrl}. Start the Spring Boot backend (port 8080) and use the Vite dev server so /api is proxied, or set VITE_API_BASE_URL. (${e.message})`
        : `Network error while calling ${baseUrl}.`
    const error: ApiError = { status: 0, message: msg, details: e }
    throw error
  }

  const text = await response.text()

  if (!response.ok) {
    const parsed = parseJsonFromText(text)
    const message =
      parsed !== undefined
        ? extractErrorMessage(parsed, response.status)
        : text.trim().slice(0, 300) || `Request failed (${response.status})`
    const error: ApiError = {
      status: response.status,
      message,
      details: parsed ?? (text.trim() ? text : undefined),
    }
    throw error
  }

  const parsedOk = parseJsonFromText(text)
  if (parsedOk !== undefined) {
    return parsedOk as T
  }
  // Plain-text success bodies (e.g. POST /users/confirm)
  if (text.trim()) {
    return text as unknown as T
  }
  return undefined as T
}

