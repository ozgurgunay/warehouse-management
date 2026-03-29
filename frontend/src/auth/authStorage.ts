export type AuthCredentials = {
  username: string
  password: string
}

const STORAGE_KEY = 'wm_auth_basic'

export function loadCredentials(): AuthCredentials | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthCredentials
  } catch {
    return null
  }
}

export function saveCredentials(credentials: AuthCredentials) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
}

export function clearCredentials() {
  localStorage.removeItem(STORAGE_KEY)
}

export function toBasicAuthHeader(credentials: AuthCredentials) {
  const encoded = btoa(`${credentials.username}:${credentials.password}`)
  return `Basic ${encoded}`
}

