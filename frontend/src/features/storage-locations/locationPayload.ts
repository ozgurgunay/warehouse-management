import type { StorageLocationWritePayload } from './types'

export type StorageLocationFormDraft = {
  warehouseId: number | null
  locationCode: string
  name: string
  building: string
  floor: string
  section: string
  zoneLabel: string
}

export function emptyLocationDraft(): StorageLocationFormDraft {
  return {
    warehouseId: null,
    locationCode: '',
    name: '',
    building: '',
    floor: '',
    section: '',
    zoneLabel: '',
  }
}

export function draftFromLocation(loc: {
  warehouseId: number
  locationCode: string | null
  name: string
  building: string | null
  floor: string | null
  section: string | null
  zoneLabel: string | null
}): StorageLocationFormDraft {
  return {
    warehouseId: loc.warehouseId,
    locationCode: loc.locationCode ?? '',
    name: loc.name,
    building: loc.building ?? '',
    floor: loc.floor ?? '',
    section: loc.section ?? '',
    zoneLabel: loc.zoneLabel ?? '',
  }
}

export function payloadFromDraft(draft: StorageLocationFormDraft): StorageLocationWritePayload {
  if (draft.warehouseId == null) {
    throw new Error('Warehouse is required.')
  }
  const name = draft.name.trim()
  if (!name) {
    throw new Error('Name is required.')
  }
  const trim = (s: string) => (s.trim() === '' ? null : s.trim())
  const locationCodeTrim = draft.locationCode.trim()
  return {
    warehouseId: draft.warehouseId,
    locationCode: locationCodeTrim.length === 0 ? null : locationCodeTrim,
    name,
    building: trim(draft.building),
    floor: trim(draft.floor),
    section: trim(draft.section),
    zoneLabel: trim(draft.zoneLabel),
  }
}
