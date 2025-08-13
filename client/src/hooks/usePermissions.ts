import { useAppSelector } from '../store/hooks';

export const usePermissions = () => {
  const user = useAppSelector(state => state.auth.user);
  const permissions = useAppSelector(state => state.auth.user?.permissions || []);

  const checkPermission = (permissionName: string): boolean => {
    return permissions.some(permission => permission.name == permissionName);
  };

  const checkAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permissionName => 
      permissions.some(permission => permission.name === permissionName)
    );
  };

  const checkAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permissionName => 
      permissions.some(permission => permission.name === permissionName)
    );
  };

  const hasRole = (roleName: string): boolean => {
    return user?.role === roleName;
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.includes(user?.role || '');
  };

  return {
    permissions,
    user,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    hasRole,
    hasAnyRole,
  };
}; 