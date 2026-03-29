import { apiRequest } from '../../services/apiClient'
import type { Role, User, UserProfilePayload } from './types'

export async function getUsers(signal?: AbortSignal) {
  return await apiRequest<User[]>({ path: '/users', signal })
}

export async function getUserById(userId: number, signal?: AbortSignal) {
  return await apiRequest<User>({ path: `/users/${userId}`, signal })
}

export async function updateUserProfile(
  userId: number,
  profile: UserProfilePayload,
  signal?: AbortSignal,
) {
  return await apiRequest<User>({
    method: 'PUT',
    path: `/users/${userId}/profile`,
    body: profile,
    signal,
  })
}

export async function getRoles(signal?: AbortSignal) {
  return await apiRequest<Role[]>({ path: '/roles', signal })
}

export async function createRole(
  dto: { name: string; description: string },
  signal?: AbortSignal,
) {
  return await apiRequest<Role>({
    method: 'POST',
    path: '/roles',
    body: dto,
    signal,
  })
}

export async function updateRole(
  roleId: number,
  dto: { name: string; description: string },
  signal?: AbortSignal,
) {
  return await apiRequest<Role>({
    method: 'PUT',
    path: `/roles/${roleId}`,
    body: dto,
    signal,
  })
}

export async function updateUserRoles(
  userId: number,
  userDTO: { username: string; email: string; enabled: boolean },
  roleIds: number[],
  signal?: AbortSignal,
) {
  // Spring can parse comma-separated values into Set<Long> for request params.
  const roleIdsCsv = roleIds.join(',')
  return await apiRequest<User>({
    method: 'PUT',
    path: `/users/${userId}`,
    query: { roleIds: roleIdsCsv },
    body: userDTO,
    signal,
  })
}

export async function updateUserEnabled(
  userId: number,
  userDTO: { username: string; email: string },
  enabled: boolean,
  roleIds: number[],
  signal?: AbortSignal,
) {
  // Controller requires roleIds request param, so we pass the user's current roles.
  const roleIdsCsv = roleIds.join(',')
  return await apiRequest<User>({
    method: 'PUT',
    path: `/users/${userId}`,
    query: { roleIds: roleIdsCsv },
    body: { ...userDTO, enabled },
    signal,
  })
}

export async function deleteUser(userId: number, signal?: AbortSignal) {
  await apiRequest<void>({ method: 'DELETE', path: `/users/${userId}`, signal })
}

export async function deleteRole(roleId: number, signal?: AbortSignal) {
  await apiRequest<void>({ method: 'DELETE', path: `/roles/${roleId}`, signal })
}

