import { getServerSession } from 'next-auth';
import { options } from '@/pages/api/auth/[...nextauth]';

export type UserRole = 'SUPERADMIN' | 'OWNER' | 'MEMBER';

// Server-side role checking
export async function getUserRole(): Promise<UserRole | null> {
  const session = await getServerSession(options);
  return (session?.user?.role as UserRole) || null;
}

// Check if user has specific role
export function hasRole(
  userRole: UserRole | null,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;

  const roleHierarchy: Record<UserRole, number> = {
    SUPERADMIN: 1,
    OWNER: 2,
    MEMBER: 3
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Check if user has any of the required roles
export function hasAnyRole(
  userRole: UserRole | null,
  requiredRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

// Check if user has admin privileges
export function isAdmin(userRole: UserRole | null): boolean {
  return hasRole(userRole, 'SUPERADMIN');
}

// Check if user has manager or admin privileges
export function isOwnerOrSuperAdmin(userRole: UserRole | null): boolean {
  return hasAnyRole(userRole, ['OWNER', 'SUPERADMIN']);
}

// Client-side role checking (for use in components)
export function useRoleCheck(session: any) {
  const userRole = session?.user?.role as UserRole;

  return {
    userRole,
    hasRole: (requiredRole: UserRole) => hasRole(userRole, requiredRole),
    hasAnyRole: (requiredRoles: UserRole[]) =>
      hasAnyRole(userRole, requiredRoles),
    isAdmin: () => isAdmin(userRole),
    isOwnerOrSuperAdmin: () => isOwnerOrSuperAdmin(userRole)
  };
}

// Check if user can access a navigation item
export function canAccessNavItem(
  userRole: UserRole | null,
  allowedRoles?: UserRole[]
): boolean {
  // If no roles specified, allow access to all users
  if (!allowedRoles || allowedRoles.length === 0) return true;
  // Check if user's role is in the allowed roles
  return userRole ? allowedRoles.includes(userRole) : false;
}

// Get filtered navigation items based on user role
export function getFilteredNavItems(
  navItems: any[],
  userRole: UserRole | null
) {
  return navItems.filter((item) => canAccessNavItem(userRole, item.roles));
}
