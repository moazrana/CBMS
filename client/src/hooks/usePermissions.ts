import { useSelector } from 'react-redux';
import { 
  selectPermissions, 
  selectUser
} from '../store/slices/authSlice';

export const usePermissions = () => {
  const permissions = useSelector(selectPermissions);
  const user = useSelector(selectUser);

  const checkPermission = (permissionName: string): boolean => {
    return permissions.some(permission => permission.name === permissionName);
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
    // Legacy selectors for compatibility
    hasPermission: (permissionName: string) => checkPermission(permissionName),
    hasAnyPermission: (permissionNames: string[]) => checkAnyPermission(permissionNames),
    hasAllPermissions: (permissionNames: string[]) => checkAllPermissions(permissionNames),
  };
}; 