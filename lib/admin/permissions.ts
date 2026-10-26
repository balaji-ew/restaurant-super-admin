/**
 * The permission matrix for presentation and access control.
 *
 * This is a presentation copy. The server re-resolves authorisation on every
 * request. It decides what is worth showing to prevent "permission denied"
 * experiences on interactive UI elements.
 */
import type { StaffRole } from './types';

export { type StaffRole };

export type ScopeType = 'brand' | 'branch' | 'central_kitchen' | string;

/** Every role, in seniority order. */
export const ALL_ROLES: StaffRole[] = [
  'super_admin',
  'admin',
  'manager',
  'staff',
];

const ALL: StaffRole[] = ALL_ROLES;

/**
 * Which roles hold each permission.
 */
export const PERMISSIONS = {
  'dashboard.view': ALL,
  'settings.view': ALL,
  'settings.manage': ['super_admin', 'admin'],
  'profile.view': ALL,
  'profile.manage': ALL,
  'users.view': ['super_admin', 'admin', 'manager'],
  'users.manage': ['super_admin', 'admin'],
} as const satisfies Record<string, readonly StaffRole[]>;

export type Permission = keyof typeof PERMISSIONS;

/** One of the signed-in user's role assignments. */
export interface RoleAssignment {
  role: StaffRole | string;
  scopeType: ScopeType;
  branchId?: string | null;
}

/**
 * What the console knows about who is signed in.
 */
export interface Viewer {
  roles: RoleAssignment[];
  /** False until the session has loaded. */
  isReady: boolean;
  /** True when any assignment covers the whole system. */
  isBrandWide: boolean;
  branchId: string | null;
  can: (permission: Permission) => boolean;
  canAny: (...permissions: Permission[]) => boolean;
}

/** Builds a viewer from the session's role assignments. */
export function viewerFrom(roles: RoleAssignment[] | undefined | null, isReady = true): Viewer {
  const list = roles ?? [];
  const held = list.map((r) => r.role);

  const isBrandWide = list.some((r) => r.scopeType === 'brand' || !r.scopeType);
  const branchId = isBrandWide ? null : (list.find((r) => r.branchId)?.branchId ?? null);

  const can = (permission: Permission): boolean => {
    const allowed = PERMISSIONS[permission] as readonly string[] | undefined;
    if (!allowed) return false;
    return held.some((role) => allowed.includes(role));
  };

  return {
    roles: list,
    isReady,
    isBrandWide,
    branchId,
    can,
    canAny: (...permissions) => permissions.some(can),
  };
}

/**
 * A viewer with nothing, for the moment before the session has loaded.
 */
export const NO_VIEWER: Viewer = viewerFrom([], false);

/** Human labels for roles. */
export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
};
