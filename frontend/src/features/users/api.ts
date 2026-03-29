import { apiRequest } from '../../services/apiClient'

import type { RegisteredUserResponse, RegistrationPayload, User, UserProfilePayload } from './types'

export async function registerUser(body: RegistrationPayload, signal?: AbortSignal) {
  return await apiRequest<RegisteredUserResponse>({
    method: 'POST',
    path: '/users/register',
    body,
    signal,
  })
}

/** Completes email verification (enables the account). Use only after explicit user action. */
export async function confirmRegistration(token: string, signal?: AbortSignal) {
  return await apiRequest<string>({
    method: 'POST',
    path: '/users/confirm',
    body: { token },
    signal,
  })
}

export async function getCurrentUserDetail(signal?: AbortSignal) {
  return await apiRequest<User>({ path: '/users/me', signal })
}

export async function updateMyProfile(profile: UserProfilePayload, signal?: AbortSignal) {
  return await apiRequest<User>({
    method: 'PUT',
    path: '/users/me/profile',
    body: profile,
    signal,
  })
}
