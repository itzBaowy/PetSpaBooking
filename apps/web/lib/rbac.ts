import { ROLES } from '@/constants/roles';

export const roleHierarchy: Record<string, string[]> = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.PROVIDER, ROLES.CUSTOMER],
  [ROLES.PROVIDER]: [ROLES.PROVIDER, ROLES.CUSTOMER],
  [ROLES.CUSTOMER]: [ROLES.CUSTOMER],
};

export function hasRole(userRole: string, requiredRole: string): boolean {
  const allowedRoles = roleHierarchy[userRole] || [];
  return allowedRoles.includes(requiredRole);
}

export function hasAnyRole(userRole: string, roles: string[]): boolean {
  return roles.some(role => hasRole(userRole, role));
}
