import { useSession } from 'next-auth/react';
import { useRoleCheck, getFilteredNavItems } from '@/lib/authUtils';
import { navItems } from '@/constants/data';
import { NavItem } from '@/types';

export function useRoleBasedNavigation() {
  const { data: session } = useSession();
  const { userRole } = useRoleCheck(session);

  // Get filtered navigation items based on user role
  const filteredNavItems = getFilteredNavItems(navItems, userRole);

  // Check if user can access a specific route
  const canAccessRoute = (route: string): boolean => {
    const navItem = navItems.find((item) => item.url === route);
    if (!navItem) return false;
    return getFilteredNavItems([navItem], userRole).length > 0;
  };

  // Get user's accessible routes
  const getAccessibleRoutes = (): string[] => {
    return filteredNavItems.map((item) => item.url);
  };

  // Check if user has access to any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    return userRole ? roles.includes(userRole) : false;
  };

  return {
    userRole,
    filteredNavItems,
    canAccessRoute,
    getAccessibleRoutes,
    hasAnyRole,
    isLoading: !session
  };
}
