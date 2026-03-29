export type {
  User,
  UserCertification,
  UserConsent,
  UserEmergencyContact,
  UserProfile,
  UserProfilePayload,
  UserRole,
} from '../users/types'

export type Role = {
  id: number
  name: string
  description?: string | null
  deleted?: boolean
  createdAt?: string
  updatedAt?: string
  lastUpdatedByUsername?: string | null
}
