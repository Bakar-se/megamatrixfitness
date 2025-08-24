# Route Configuration System

This document explains the route configuration system used in the MegaMatrix Fitness application for role-based access control.

## Overview

The route configuration system provides a centralized way to manage which user roles can access specific routes. It's designed to work seamlessly with the middleware and provides both security and maintainability.

## Route Categories

### 1. SUPERADMIN Routes

**Highest level access - only SUPERADMIN users can access**

```typescript
export const SUPERADMIN_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard/subscription',
    roles: ['SUPERADMIN'],
    description: 'Manage subscription plans and features'
  },
  {
    path: '/dashboard/product',
    roles: ['SUPERADMIN'],
    description: 'Manage product catalog and inventory'
  },
  {
    path: '/admin',
    roles: ['SUPERADMIN'],
    description: 'System administration panel'
  },
  {
    path: '/system-settings',
    roles: ['SUPERADMIN'],
    description: 'Global system configuration'
  },
  {
    path: '/user-management',
    roles: ['SUPERADMIN'],
    description: 'Manage all users and roles'
  },
  {
    path: '/api/admin',
    roles: ['SUPERADMIN'],
    description: 'Admin API endpoints'
  }
];
```

### 2. OWNER Routes

**Business owner level access - SUPERADMIN and OWNER users can access**

```typescript
export const OWNER_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard/subscription',
    roles: ['SUPERADMIN', 'OWNER'],
    description: 'Manage subscription plans and features'
  },
  {
    path: '/dashboard/product',
    roles: ['SUPERADMIN', 'OWNER'],
    description: 'Manage product catalog and inventory'
  },
  {
    path: '/dashboard/clients',
    roles: ['SUPERADMIN', 'OWNER'],
    description: 'Manage client information and relationships'
  },
  {
    path: '/business-settings',
    roles: ['SUPERADMIN', 'OWNER'],
    description: 'Business-specific configuration'
  },
  {
    path: '/billing',
    roles: ['SUPERADMIN', 'OWNER'],
    description: 'Billing and payment management'
  },
  {
    path: '/api/business',
    roles: ['SUPERADMIN', 'OWNER'],
    description: 'Business API endpoints'
  }
];
```

### 3. MEMBER Routes

**Basic user access - all authenticated users can access**

```typescript
export const MEMBER_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard/overview',
    roles: ['SUPERADMIN', 'OWNER', 'MEMBER'],
    description: 'Dashboard overview and statistics'
  },
  {
    path: '/dashboard/clients',
    roles: ['SUPERADMIN', 'OWNER', 'MEMBER'],
    description: 'View client information'
  },
  {
    path: '/dashboard/kanban',
    roles: ['SUPERADMIN', 'OWNER', 'MEMBER'],
    description: 'Project management and task tracking'
  },
  {
    path: '/profile',
    roles: ['SUPERADMIN', 'OWNER', 'MEMBER'],
    description: 'User profile management'
  },
  {
    path: '/api/user',
    roles: ['SUPERADMIN', 'OWNER', 'MEMBER'],
    description: 'User-specific API endpoints'
  }
];
```

### 4. Authenticated Routes

**Routes that require any authenticated user**

```typescript
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
  }
];
```

## Route Configuration Interface

Each route is defined using the `RouteConfig` interface:

```typescript
export interface RouteConfig {
  path: string; // The route path to match
  roles: UserRole[]; // Array of roles that can access this route
  description: string; // Human-readable description of the route
}
```

## Helper Functions

### 1. `canAccessRoute(userRole, routePath)`

Checks if a user with a specific role can access a given route.

```typescript
import { canAccessRoute } from '@/config/routes';

// Check if SUPERADMIN can access subscription page
const canAccess = canAccessRoute('SUPERADMIN', '/dashboard/subscription');
// Returns: true

// Check if MEMBER can access subscription page
const canAccess = canAccessRoute('MEMBER', '/dashboard/subscription');
// Returns: false
```

### 2. `getRouteConfig(path)`

Gets the configuration for a specific route.

```typescript
import { getRouteConfig } from '@/config/routes';

const config = getRouteConfig('/dashboard/subscription');
// Returns: RouteConfig object with path, roles, and description
```

### 3. `getRequiredRoles(path)`

Gets the required roles for a specific route.

```typescript
import { getRequiredRoles } from '@/config/routes';

const requiredRoles = getRequiredRoles('/dashboard/subscription');
// Returns: ['SUPERADMIN', 'OWNER']
```

## Middleware Integration

The middleware uses the route configuration to protect routes:

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { canAccessRoute } from '@/config/routes';
import { UserRole } from '@/lib/authUtils';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If no token, redirect to signin
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    const userRole = token.role as UserRole;

    // Check if user can access the requested route
    if (!canAccessRoute(userRole, pathname)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);
```

## Adding New Routes

To add a new route, simply add it to the appropriate array in `src/config/routes.ts`:

```typescript
// Add to SUPERADMIN_ROUTES for admin-only access
{
  path: '/new-admin-feature',
  roles: ['SUPERADMIN'],
  description: 'New admin-only feature'
}

// Add to OWNER_ROUTES for owner+ access
{
  path: '/new-owner-feature',
  roles: ['SUPERADMIN', 'OWNER'],
  description: 'New owner-level feature'
}

// Add to MEMBER_ROUTES for all authenticated users
{
  path: '/new-member-feature',
  roles: ['SUPERADMIN', 'OWNER', 'MEMBER'],
  description: 'New feature for all users'
}
```

## Route Matching Logic

The system uses `pathname.startsWith(route.path)` for matching, which means:

- `/dashboard/subscription` matches `/dashboard/subscription`
- `/dashboard/subscription/123` matches `/dashboard/subscription`
- `/dashboard/subscription/edit` matches `/dashboard/subscription`

This allows for flexible route hierarchies while maintaining security.

## Security Features

1. **Server-side protection**: Middleware runs before any page rendering
2. **Role validation**: Each route is checked against user roles
3. **Automatic redirects**: Unauthorized access attempts are redirected
4. **Centralized configuration**: All route permissions in one place
5. **Type safety**: Full TypeScript support for route configurations

## Best Practices

1. **Use descriptive paths**: Make route paths clear and logical
2. **Provide descriptions**: Add meaningful descriptions for each route
3. **Follow role hierarchy**: SUPERADMIN > OWNER > MEMBER
4. **Test thoroughly**: Verify all role combinations work correctly
5. **Document changes**: Update this document when adding new routes

## Example Usage in Components

```typescript
import { useRoleBasedNavigation } from '@/hooks/use-role-based-nav';

function MyComponent() {
  const { canAccessRoute } = useRoleBasedNavigation();

  // Show subscription link only if user has access
  if (canAccessRoute('/dashboard/subscription')) {
    return <SubscriptionLink />;
  }

  return null;
}
```

## Troubleshooting

### Common Issues

1. **Route not protected**: Ensure the route is added to the appropriate array
2. **Type errors**: Check that UserRole types match between files
3. **Middleware not working**: Verify the config.matcher includes the route
4. **Permission denied**: Check if user role is included in route.roles array

### Debug Mode

Enable debug logging in the middleware to see route checking:

```typescript
// Add this to middleware for debugging
console.log('Checking route:', pathname, 'for user role:', userRole);
console.log('Access granted:', canAccessRoute(userRole, pathname));
```

This route configuration system provides a robust, maintainable way to manage role-based access control throughout your application.
