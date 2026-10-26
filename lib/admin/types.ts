/**
 * Domain types for the admin console template.
 *
 * Provides shared primitives, pagination types, and core staff/user identity types.
 * Modules added to this template can define their specific types alongside these.
 */

/* ------------------------------------------------------------------ shared */

/** Integer minor units (e.g. cents). */
export type Money = number;

export type ID = string;

export interface Paged<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages?: number;
}

export type EntityStatus = 'pending' | 'active' | 'suspended' | 'closed';

/* -------------------------------------------------------------------- staff */

export type StaffRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'staff';

export interface StaffRoleAssignment {
  role: string;
  scopeType: 'brand' | 'branch' | 'central_kitchen' | string;
  branchId?: string | null;
}

export interface StaffUser {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  scopeType?: string;
  branchId?: ID | null;
  scopeLabel?: string;
  isActive: boolean;
  lastActiveAt?: string | null;
}
