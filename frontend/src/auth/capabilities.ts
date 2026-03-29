export type Capability =
  | 'admin.manage_users'
  | 'admin.manage_roles'
  | 'warehouses.read'
  | 'warehouses.write'
  | 'inventory.read'
  | 'inventory.write'
  | 'operations.read'
  | 'operations.write'
  | 'sales.read'
  | 'sales.write'
  | 'packages.read'
  | 'packages.write'

// Map capabilities to roles.
// Update this map when you introduce new roles later.
export const roleCapabilities: Record<string, Capability[]> = {
  ROLE_ADMIN: [
    'admin.manage_users',
    'admin.manage_roles',
    'warehouses.read',
    'warehouses.write',
    'inventory.read',
    'inventory.write',
    'operations.read',
    'operations.write',
    'sales.read',
    'sales.write',
    'packages.read',
    'packages.write',
  ],
  ROLE_USER: [
    'warehouses.read',
    'inventory.read',
    'operations.read',
    'sales.read',
    'packages.read',
  ],
}

