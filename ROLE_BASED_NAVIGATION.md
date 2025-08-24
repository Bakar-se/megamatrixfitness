# Role-Based Navigation System

This document explains how the role-based navigation system works in the MegaMatrix Fitness application.

## Overview

The application implements a comprehensive role-based access control (RBAC) system that manages navigation items and page access based on user roles: `SUPERADMIN`, `OWNER`, and `MEMBER`.

## User Roles

### SUPERADMIN
- **Highest level of access**
- Can access all features and pages
- Can manage subscriptions, products, clients, and all system settings
- Has full administrative privileges

### OWNER
- **Business owner level access**
- Can manage subscriptions, products, and clients
- Cannot access super admin features
- Has business-level administrative privileges

### MEMBER
- **Basic user access**
- Can view dashboard and clients
- Can access Kanban board
- Limited to viewing and basic operations

## Navigation Structure

### Dashboard
- **URL**: `/dashboard/overview`
- **Access**: All roles (`SUPERADMIN`, `OWNER`, `MEMBER`)
- **Description**: Main dashboard with overview statistics

### Subscriptions
- **URL**: `/dashboard/subscription`
- **Access**: `SUPERADMIN`, `OWNER` only
- **Description**: Manage subscription plans and features

### Clients
- **URL**: `/dashboard/clients`
- **Access**: All roles (`SUPERADMIN`, `OWNER`, `MEMBER`)
- **Description**: View and manage client information

### Products
- **URL**: `/dashboard/product`
- **Access**: `SUPERADMIN`, `OWNER` only
- **Description**: Manage product catalog and inventory

### Kanban
- **URL**: `/dashboard/kanban`
- **Access**: All roles (`SUPERADMIN`, `OWNER`, `MEMBER`)
- **Description**: Project management and task tracking

## Implementation Details

### 1. Navigation Data Structure

Navigation items are defined in `src/constants/data.ts` with role-based access control:

```typescript
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    roles: ['SUPERADMIN', 'OWNER', 'MEMBER'] // All roles can access
  },
  {
    title: 'Subscriptions',
    url: '/dashboard/subscription',
    icon: 'subscriptions',
    roles: ['SUPERADMIN', 'OWNER'] // Only admin roles
  }
  // ... more items
];
```

### 2. Type Definitions

The `NavItem` interface in `src/types/index.ts` includes role requirements:

```typescript
export interface NavItem {
  title: string;
  url: string;
  icon?: keyof typeof Icons;
  roles?: UserRole[]; // Array of roles that can access this item
  // ... other properties
}
```

### 3. Role-Based Navigation Hook

The `useRoleBasedNavigation` hook in `src/hooks/use-role-based-nav.ts` provides:

- Filtered navigation items based on user role
- Route access checking
- User role information
- Loading states

```typescript
export function useRoleBasedNavigation() {
  const { data: session } = useSession();
  const { userRole } = useRoleCheck(session);
  
  const filteredNavItems = getFilteredNavItems(navItems, userRole);
  const canAccessRoute = (route: string): boolean => { /* ... */ };
  
  return {
    userRole,
    filteredNavItems,
    canAccessRoute,
    // ... other utilities
  };
}
```

### 4. Permission Guard Components

The `PermissionGuard` component system provides reusable permission checking:

```typescript
// Basic permission guard
<PermissionGuard requiredRoles={['SUPERADMIN', 'OWNER']}>
  <ProtectedContent />
</PermissionGuard>

// Convenience components
<SuperAdminOnly>Admin Only Content</SuperAdminOnly>
<OwnerOrHigher>Owner+ Content</OwnerOrHigher>
<MemberOrHigher>Member+ Content</MemberOrHigher>
```

### 5. Sidebar Implementation

The `AppSidebar` component automatically filters navigation items:

```typescript
export default function AppSidebar() {
  const { filteredNavItems } = useRoleBasedNavigation();
  
  return (
    <Sidebar>
      {/* Only shows items user has access to */}
      {filteredNavItems.map((item) => (
        <NavigationItem key={item.title} item={item} />
      ))}
    </Sidebar>
  );
}
```

## Usage Examples

### Protecting Individual Pages

```typescript
// In a page component
import { OwnerOrHigher } from '@/components/permission-guard';

export default function SubscriptionPage() {
  return (
    <OwnerOrHigher fallback={<AccessDenied />}>
      <SubscriptionContent />
    </OwnerOrHigher>
  );
}
```

### Conditional Rendering

```typescript
import { ConditionalRender } from '@/components/permission-guard';

<ConditionalRender
  superAdmin={<SuperAdminPanel />}
  owner={<OwnerPanel />}
  member={<MemberPanel />}
  default={<BasicPanel />}
/>
```

### Checking Route Access

```typescript
import { useRoleBasedNavigation } from '@/hooks/use-role-based-nav';

function MyComponent() {
  const { canAccessRoute } = useRoleBasedNavigation();
  
  if (canAccessRoute('/dashboard/subscription')) {
    return <SubscriptionLink />;
  }
  
  return null;
}
```

## Security Features

1. **Client-Side Filtering**: Navigation items are filtered based on user role
2. **Page-Level Protection**: Individual pages can be protected with permission guards
3. **Route Validation**: Utility functions to check route access programmatically
4. **Fallback Handling**: Graceful fallbacks when access is denied
5. **Session Management**: Proper session handling with NextAuth.js

## Best Practices

1. **Always use PermissionGuard**: Protect sensitive pages and components
2. **Provide meaningful fallbacks**: Show helpful messages when access is denied
3. **Use the hook consistently**: Use `useRoleBasedNavigation` for navigation logic
4. **Test role scenarios**: Ensure all role combinations work correctly
5. **Keep roles minimal**: Only grant necessary permissions to each role

## Future Enhancements

- **Dynamic role management**: Allow admins to create custom roles
- **Permission inheritance**: Implement role hierarchy and permission inheritance
- **Audit logging**: Track access attempts and permission changes
- **Fine-grained permissions**: More granular control over specific actions
- **Role templates**: Predefined role templates for common use cases
