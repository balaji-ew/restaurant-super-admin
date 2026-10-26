import { ALL_ROLES } from './permissions';
import type { StaffRole } from './types';

/**
 * Role labels in one place.
 */
export const ROLE_LABEL: Record<StaffRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
};

/**
 * Role descriptions for role selection and management.
 */
export const ROLE_DESCRIPTION: Record<StaffRole, string> = {
  super_admin: 'Full system control and administrative access across all modules.',
  admin: 'Administrative access for system configuration and user management.',
  manager: 'Operational management access.',
  staff: 'Standard staff access.',
};

export const CREATE_USER_ROLES: Record<StaffRole, StaffRole[]> = {
  super_admin: [...ALL_ROLES],
  admin: ['admin', 'manager', 'staff'],
  manager: ['staff'],
  staff: [],
};

/**
 * Whether someone holding `viewerRole` may edit an account holding `targetRole`.
 */
export function canManageRole(viewerRole: StaffRole | undefined, targetRole: StaffRole): boolean {
  return viewerRole ? (CREATE_USER_ROLES[viewerRole] ?? []).includes(targetRole) : false;
}

export const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as StaffRole[]).map((role) => ({
  value: role,
  label: ROLE_LABEL[role],
}));
