/** Subset of role fields returned on user DTOs (avoids circular imports with admin types). */
export type UserRole = {
  id: number
  name: string
  description?: string | null
  deleted?: boolean
  createdAt?: string
  updatedAt?: string
  lastUpdatedByUsername?: string | null
}

export type UserEmergencyContact = {
  id?: number
  fullName: string
  relationship?: string | null
  phonePrimary: string
  phoneSecondary?: string | null
  sortOrder?: number
}

export type UserCertification = {
  id?: number
  certificationType: string
  certificateNumber?: string | null
  issuedAt?: string | null
  expiresAt?: string | null
  issuerName?: string | null
}

export type UserConsent = {
  id: number
  consentType: string
  documentVersion: string
  consentedAt: string
  withdrawnAt?: string | null
}

/** Writable profile body (PUT /users/me/profile, PUT /users/{id}/profile, registration). */
export type UserProfilePayload = {
  firstName?: string | null
  lastName?: string | null
  middleName?: string | null
  mobilePhone?: string | null
  workPhone?: string | null
  birthDate?: string | null
  employeeNumber?: string | null
  department?: string | null
  jobTitle?: string | null
  hireDate?: string | null
  addressLine1?: string | null
  city?: string | null
  postalCode?: string | null
  countryCode?: string | null
  preferredLocale?: string | null
  timeZone?: string | null
  nationalIdLastFour?: string | null
  emergencyContacts?: UserEmergencyContact[]
  certifications?: UserCertification[]
}

/** API response profile (includes audit fields). */
export type UserProfile = UserProfilePayload & {
  id?: number
  userId?: number
  createdAt?: string
  updatedAt?: string
  lastUpdatedByUsername?: string | null
}

export type User = {
  id: number
  username: string
  email: string
  roleDTOs: UserRole[]
  enabled: boolean
  createdAt: string
  updatedAt: string
  lastUpdatedByUsername?: string | null
  profile?: UserProfile | null
  consents?: UserConsent[] | null
}

export type ConsentAcceptancePayload = {
  consentType: string
  documentVersion: string
  accepted: boolean
}

/** Response from {@code POST /users/register}. */
export type RegisteredUserResponse = {
  id: number
  username: string
  email: string
  enabled: boolean
}

export type RegistrationPayload = {
  username: string
  email: string
  password: string
  /** Required: first and last name at minimum (see backend validation). */
  profile: UserProfilePayload
  consents: ConsentAcceptancePayload[]
}
