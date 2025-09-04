import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  role?: string;
  roles?: string[];
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  role,
  roles,
}) => {
  const { checkPermission, checkAnyPermission, checkAllPermissions, hasRole, hasAnyRole } = usePermissions();

  // Check role-based access
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (roles && !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (permission && !checkPermission(permission)) {
    return <>{fallback}</>;
  }

  if (permissions) {
    if (requireAll) {
      if (!checkAllPermissions(permissions)) {
        return <>{fallback}</>;
      }
    } else {
      if (!checkAnyPermission(permissions)) {
        return <>{fallback}</>;
      }
    }
  }

  return <>{children}</>;
}; 