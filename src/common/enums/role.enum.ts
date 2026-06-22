/**
 * Role-based access control levels, ordered by privilege. Guards compare
 * the authenticated user's role against the route's required roles.
 */
export enum Role {
  /** Full control incl. settings, user management, financial corrections. */
  OWNER = 'OWNER',
  /** Branch-level management: rooms, computers, pricing, reports. */
  MANAGER = 'MANAGER',
  /** Front desk: open/close sessions, take payments, manage customers. */
  CASHIER = 'CASHIER',
}

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.OWNER]: [Role.OWNER, Role.MANAGER, Role.CASHIER],
  [Role.MANAGER]: [Role.MANAGER, Role.CASHIER],
  [Role.CASHIER]: [Role.CASHIER],
};
