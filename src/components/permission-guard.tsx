'use client';

import { useRoleBasedNavigation } from '@/hooks/use-role-based-nav';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  requiredRoles,
  fallback = <div>Access Denied</div>
}: PermissionGuardProps) {
  const { userRole, hasAnyRole, isLoading } = useRoleBasedNavigation();

  // Show loading state while session is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If no roles specified, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the required roles
  if (userRole && hasAnyRole(requiredRoles)) {
    return <>{children}</>;
  }

  // Access denied - show fallback
  return <>{fallback}</>;
}

// Convenience components for common permission checks
export function SuperAdminOnly({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard requiredRoles={['SUPERADMIN']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function OwnerOnly({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard requiredRoles={['OWNER']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function MemberOnly({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard requiredRoles={['MEMBER']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function OwnerOrHigher({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      requiredRoles={['SUPERADMIN', 'OWNER']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function MemberOrHigher({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      requiredRoles={['SUPERADMIN', 'OWNER', 'MEMBER']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

// Component for showing different content based on permissions
interface ConditionalRenderProps {
  superAdmin?: ReactNode;
  owner?: ReactNode;
  member?: ReactNode;
  default?: ReactNode;
}

export function ConditionalRender({
  superAdmin,
  owner,
  member,
  default: fallback
}: ConditionalRenderProps) {
  const { userRole } = useRoleBasedNavigation();

  if (userRole === 'SUPERADMIN' && superAdmin) {
    return <>{superAdmin}</>;
  }

  if (userRole === 'OWNER' && owner) {
    return <>{owner}</>;
  }

  if (userRole === 'MEMBER' && member) {
    return <>{member}</>;
  }

  return <>{fallback}</>;
}
