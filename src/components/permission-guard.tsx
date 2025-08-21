"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { UserRole } from "@/lib/rbac";

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  requiredPath?: string;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function PermissionGuard({
  children,
  requiredRole,
  requiredRoles,
  requiredPath,
  fallback = null,
  showFallback = true,
}: PermissionGuardProps) {
  const { 
    hasRole, 
    hasAnyRole, 
    canAccess, 
    meetsRoleRequirement,
    currentRole 
  } = usePermissions();

  // Check role-based permissions
  if (requiredRole && !hasRole(requiredRole)) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Check multiple role requirements
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Check path-based permissions
  if (requiredPath && !canAccess(requiredPath)) {
    return showFallback ? <>{fallback}</> : null;
  }

  // If no specific requirements, just check if user meets role requirements for current path
  if (!requiredRole && !requiredRoles && !requiredPath) {
    // This is a basic permission check - you might want to customize this
    if (!currentRole) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
}

// Convenience components for common permission checks
export function SuperAdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole="SUPERADMIN" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function OwnerOrHigher({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRoles={["OWNER", "SUPERADMIN"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function MemberOrHigher({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRoles={["MEMBER", "OWNER", "SUPERADMIN"]} fallback={fallback}>
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

export function ConditionalRender({ superAdmin, owner, member, default : fallback }: ConditionalRenderProps) {
  const { isSuperAdmin, isOwnerOrHigher, isMemberOrHigher } = usePermissions();

  if (isSuperAdmin && superAdmin) {
    return <>{superAdmin}</>;
  }

  if (isOwnerOrHigher && owner) {
    return <>{owner}</>;
  }

  if (isMemberOrHigher && member) {
    return <>{member}</>;
  }

  return <>{fallback}</>;
}
