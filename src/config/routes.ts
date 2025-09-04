import { UserRole } from '@/lib/authUtils';

// Define route access patterns
export interface RouteConfig {
  path: string;
  roles: UserRole[];
  description: string;
}

// SUPERADMIN only routes - highest level access
export const SUPERADMIN_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard/overview',
    roles: ['SUPERADMIN', 'OWNER'],
    description: 'Dashboard overview and statistics'
  },
  {
    path: '/dashboard/subscription',
    roles: ['SUPERADMIN'],
    description: 'Manage subscription plans and features'
  },
  {
    path: '/dashboard/clients',
    roles: ['SUPERADMIN'],
    description: 'System administration panel'
  },
  {
    path: '/api/admin',
    roles: ['SUPERADMIN'],
    description: 'Admin API endpoints'
  }
];

// OWNER and above routes - business owner level access
export const OWNER_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard/locations',
    roles: ['OWNER'],
    description: 'Manage locations'
  },
  {
    path: '/dashboard/members',
    roles: ['OWNER'],
    description: 'Manage members'
  },
  {
    path: '/dashboard/equipments',
    roles: ['OWNER'],
    description: 'Manage equipments'
  },
  {
    path: '/dashboard/todos',
    roles: ['OWNER'],
    description: 'Manage todos'
  }
];

// MEMBER and above routes - basic user access
export const MEMBER_ROUTES: RouteConfig[] = [];

// Routes that require any authenticated user
export const AUTHENTICATED_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    roles: ['SUPERADMIN', 'OWNER', 'MEMBER'],
    description: 'Main dashboard area'
  },
  {
    path: '/profile',
    roles: ['SUPERADMIN', 'OWNER', 'MEMBER'],
    description: 'User profile and settings'
  },
  {
    path: '/settings',
    roles: ['SUPERADMIN', 'OWNER', 'MEMBER'],
    description: 'User preferences and settings'
  },
  {
    path: '/dashboard/locations',
    roles: ['OWNER'],
    description: 'Manage locations'
  },
  {
    path: '/dashboard/members',
    roles: ['OWNER'],
    description: 'Manage members'
  },
  {
    path: '/dashboard/equipments',
    roles: ['OWNER'],
    description: 'Manage equipments'
  },
  {
    path: '/dashboard/todos',
    roles: ['OWNER'],
    description: 'Manage todos'
  }
];

// Helper functions for route checking
export function canAccessRoute(
  userRole: UserRole | null,
  routePath: string
): boolean {
  if (!userRole) return false;

  // Check SUPERADMIN routes first
  if (SUPERADMIN_ROUTES.some((route) => routePath.startsWith(route.path))) {
    const routeConfig = SUPERADMIN_ROUTES.find((route) =>
      routePath.startsWith(route.path)
    );
    return routeConfig ? routeConfig.roles.includes(userRole) : false;
  }

  // Check OWNER routes
  if (OWNER_ROUTES.some((route) => routePath.startsWith(route.path))) {
    const routeConfig = OWNER_ROUTES.find((route) =>
      routePath.startsWith(route.path)
    );
    return routeConfig ? routeConfig.roles.includes(userRole) : false;
  }

  // Check MEMBER routes
  if (MEMBER_ROUTES.some((route) => routePath.startsWith(route.path))) {
    const routeConfig = MEMBER_ROUTES.find((route) =>
      routePath.startsWith(route.path)
    );
    return routeConfig ? routeConfig.roles.includes(userRole) : false;
  }

  // Check authenticated routes
  if (AUTHENTICATED_ROUTES.some((route) => routePath.startsWith(route.path))) {
    const routeConfig = AUTHENTICATED_ROUTES.find((route) =>
      routePath.startsWith(route.path)
    );
    return routeConfig ? routeConfig.roles.includes(userRole) : false;
  }

  // Default: allow access if user has any role
  return true;
}

export function getRouteConfig(path: string): RouteConfig | null {
  const allRoutes = [
    ...SUPERADMIN_ROUTES,
    ...OWNER_ROUTES,
    ...MEMBER_ROUTES,
    ...AUTHENTICATED_ROUTES
  ];
  return allRoutes.find((route) => path.startsWith(route.path)) || null;
}

export function getRequiredRoles(path: string): UserRole[] {
  const config = getRouteConfig(path);
  return config ? config.roles : [];
}

// Export all routes for easy access
export const ALL_ROUTES = {
  SUPERADMIN: SUPERADMIN_ROUTES,
  OWNER: OWNER_ROUTES,
  MEMBER: MEMBER_ROUTES,
  AUTHENTICATED: AUTHENTICATED_ROUTES
};
