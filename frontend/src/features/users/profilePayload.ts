import type { UserCertification, UserEmergencyContact, UserProfile, UserProfilePayload } from './types'

export function emptyProfilePayload(): UserProfilePayload {
  return {
    firstName: '',
    lastName: '',
    middleName: '',
    mobilePhone: '',
    workPhone: '',
    birthDate: '',
    employeeNumber: '',
    department: '',
    jobTitle: '',
    hireDate: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    countryCode: '',
    preferredLocale: '',
    timeZone: '',
    nationalIdLastFour: '',
    emergencyContacts: [],
    certifications: [],
  }
}

export function profileFromApi(p: UserProfile | null | undefined): UserProfilePayload {
  if (!p) return emptyProfilePayload()
  return {
    firstName: p.firstName ?? '',
    lastName: p.lastName ?? '',
    middleName: p.middleName ?? '',
    mobilePhone: p.mobilePhone ?? '',
    workPhone: p.workPhone ?? '',
    birthDate: p.birthDate ?? '',
    employeeNumber: p.employeeNumber ?? '',
    department: p.department ?? '',
    jobTitle: p.jobTitle ?? '',
    hireDate: p.hireDate ?? '',
    addressLine1: p.addressLine1 ?? '',
    city: p.city ?? '',
    postalCode: p.postalCode ?? '',
    countryCode: p.countryCode ?? '',
    preferredLocale: p.preferredLocale ?? '',
    timeZone: p.timeZone ?? '',
    nationalIdLastFour: p.nationalIdLastFour ?? '',
    emergencyContacts: (p.emergencyContacts ?? []).map((e) => ({
      id: e.id,
      fullName: e.fullName ?? '',
      relationship: e.relationship ?? '',
      phonePrimary: e.phonePrimary ?? '',
      phoneSecondary: e.phoneSecondary ?? '',
      sortOrder: e.sortOrder,
    })),
    certifications: (p.certifications ?? []).map((c) => ({
      id: c.id,
      certificationType: c.certificationType ?? '',
      certificateNumber: c.certificateNumber ?? '',
      issuedAt: c.issuedAt ?? '',
      expiresAt: c.expiresAt ?? '',
      issuerName: c.issuerName ?? '',
    })),
  }
}

function trimOrUndef(s: string | null | undefined): string | undefined {
  if (s == null) return undefined
  const t = String(s).trim()
  return t.length ? t : undefined
}

/** Remove empty strings; omit profile key entirely if nothing meaningful (for registration). */
export function sanitizeProfileForApi(p: UserProfilePayload): UserProfilePayload | undefined {
  const emergency: UserEmergencyContact[] = (p.emergencyContacts ?? [])
    .filter((e) => trimOrUndef(e.fullName) && trimOrUndef(e.phonePrimary))
    .map((e, i) => ({
      fullName: trimOrUndef(e.fullName)!,
      relationship: trimOrUndef(e.relationship),
      phonePrimary: trimOrUndef(e.phonePrimary)!,
      phoneSecondary: trimOrUndef(e.phoneSecondary),
      sortOrder: e.sortOrder ?? i,
    }))

  const certifications: UserCertification[] = (p.certifications ?? [])
    .filter((c) => trimOrUndef(c.certificationType))
    .map((c) => ({
      certificationType: trimOrUndef(c.certificationType)!,
      certificateNumber: trimOrUndef(c.certificateNumber),
      issuedAt: trimOrUndef(c.issuedAt as string) || undefined,
      expiresAt: trimOrUndef(c.expiresAt as string) || undefined,
      issuerName: trimOrUndef(c.issuerName),
    }))

  const out: UserProfilePayload = {
    firstName: trimOrUndef(p.firstName),
    lastName: trimOrUndef(p.lastName),
    middleName: trimOrUndef(p.middleName),
    mobilePhone: trimOrUndef(p.mobilePhone),
    workPhone: trimOrUndef(p.workPhone),
    birthDate: trimOrUndef(p.birthDate as string) || undefined,
    employeeNumber: trimOrUndef(p.employeeNumber),
    department: trimOrUndef(p.department),
    jobTitle: trimOrUndef(p.jobTitle),
    hireDate: trimOrUndef(p.hireDate as string) || undefined,
    addressLine1: trimOrUndef(p.addressLine1),
    city: trimOrUndef(p.city),
    postalCode: trimOrUndef(p.postalCode),
    countryCode: trimOrUndef(p.countryCode),
    preferredLocale: trimOrUndef(p.preferredLocale),
    timeZone: trimOrUndef(p.timeZone),
    nationalIdLastFour: trimOrUndef(p.nationalIdLastFour),
    emergencyContacts: emergency.length ? emergency : undefined,
    certifications: certifications.length ? certifications : undefined,
  }

  const hasScalar = Object.entries(out).some(
    ([k, v]) =>
      k !== 'emergencyContacts' &&
      k !== 'certifications' &&
      v !== undefined &&
      v !== null,
  )
  if (!hasScalar && !emergency.length && !certifications.length) return undefined
  return out
}

export function profilePayloadForPut(p: UserProfilePayload): UserProfilePayload {
  const emergency: UserEmergencyContact[] = (p.emergencyContacts ?? [])
    .filter((e) => trimOrUndef(e.fullName) && trimOrUndef(e.phonePrimary))
    .map((e, i) => ({
      fullName: trimOrUndef(e.fullName)!,
      relationship: trimOrUndef(e.relationship),
      phonePrimary: trimOrUndef(e.phonePrimary)!,
      phoneSecondary: trimOrUndef(e.phoneSecondary),
      sortOrder: e.sortOrder ?? i,
    }))
  const certifications: UserCertification[] = (p.certifications ?? [])
    .filter((c) => trimOrUndef(c.certificationType))
    .map((c) => ({
      certificationType: trimOrUndef(c.certificationType)!,
      certificateNumber: trimOrUndef(c.certificateNumber),
      issuedAt: trimOrUndef(c.issuedAt as string) || undefined,
      expiresAt: trimOrUndef(c.expiresAt as string) || undefined,
      issuerName: trimOrUndef(c.issuerName),
    }))
  return {
    firstName: trimOrUndef(p.firstName) ?? '',
    lastName: trimOrUndef(p.lastName) ?? '',
    middleName: trimOrUndef(p.middleName) ?? '',
    mobilePhone: trimOrUndef(p.mobilePhone) ?? '',
    workPhone: trimOrUndef(p.workPhone) ?? '',
    birthDate: trimOrUndef(p.birthDate as string) ?? '',
    employeeNumber: trimOrUndef(p.employeeNumber) ?? '',
    department: trimOrUndef(p.department) ?? '',
    jobTitle: trimOrUndef(p.jobTitle) ?? '',
    hireDate: trimOrUndef(p.hireDate as string) ?? '',
    addressLine1: trimOrUndef(p.addressLine1) ?? '',
    city: trimOrUndef(p.city) ?? '',
    postalCode: trimOrUndef(p.postalCode) ?? '',
    countryCode: trimOrUndef(p.countryCode) ?? '',
    preferredLocale: trimOrUndef(p.preferredLocale) ?? '',
    timeZone: trimOrUndef(p.timeZone) ?? '',
    nationalIdLastFour: trimOrUndef(p.nationalIdLastFour) ?? '',
    emergencyContacts: emergency,
    certifications: certifications,
  }
}

export function registrationProfileHasPersonalData(p: UserProfilePayload): boolean {
  const s = sanitizeProfileForApi(p)
  if (!s) return false
  return !!(
    s.birthDate ||
    s.firstName ||
    s.lastName ||
    s.middleName ||
    s.mobilePhone ||
    s.workPhone ||
    s.nationalIdLastFour ||
    s.addressLine1 ||
    s.employeeNumber
  )
}

/**
 * For user creation: full profile draft or only mandatory first/last when extended HR fields are hidden.
 */
export function profilePayloadForUserCreate(
  draft: UserProfilePayload,
  includeExtendedProfileFields: boolean,
): UserProfilePayload {
  if (includeExtendedProfileFields) return draft
  return {
    ...emptyProfilePayload(),
    firstName: draft.firstName,
    lastName: draft.lastName,
  }
}
