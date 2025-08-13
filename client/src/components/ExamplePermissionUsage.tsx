import React from 'react';
import { PermissionGuard } from './PermissionGuard';
import { usePermissions } from '../hooks/usePermissions';

export const ExamplePermissionUsage: React.FC = () => {
  const { permissions, user, checkPermission, hasRole } = usePermissions();

  return (
    <div>
      <h2>Permission Examples</h2>
      
      {/* Show user info */}
      <div>
        <h3>User Information</h3>
        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      {/* Show all permissions */}
      <div>
        <h3>User Permissions</h3>
        <ul>
          {permissions.map((permission, index) => (
            <li key={index}>{permission.name}</li>
          ))}
        </ul>
      </div>

      {/* Example 1: Show content only if user has specific permission */}
      <PermissionGuard permission="create_user">
        <div>
          <h3>Create User Section</h3>
          <p>This content is only visible to users with 'create_user' permission.</p>
          <button>Create New User</button>
        </div>
      </PermissionGuard>

      {/* Example 2: Show content if user has any of the specified permissions */}
      <PermissionGuard permissions={['read_users', 'write_users']}>
        <div>
          <h3>User Management Section</h3>
          <p>This content is visible to users with either 'read_users' or 'write_users' permission.</p>
          <button>Manage Users</button>
        </div>
      </PermissionGuard>

      {/* Example 3: Show content only if user has ALL specified permissions */}
      <PermissionGuard permissions={['read_reports', 'write_reports', 'delete_reports']} requireAll>
        <div>
          <h3>Full Report Management</h3>
          <p>This content is only visible to users with ALL report permissions.</p>
          <button>Full Report Access</button>
        </div>
      </PermissionGuard>

      {/* Example 4: Role-based access */}
      <PermissionGuard role="admin">
        <div>
          <h3>Admin Only Section</h3>
          <p>This content is only visible to admin users.</p>
          <button>Admin Actions</button>
        </div>
      </PermissionGuard>

      {/* Example 5: Multiple roles */}
      <PermissionGuard roles={['admin', 'manager']}>
        <div>
          <h3>Management Section</h3>
          <p>This content is visible to admin or manager users.</p>
          <button>Management Actions</button>
        </div>
      </PermissionGuard>

      {/* Example 6: Custom fallback */}
      <PermissionGuard 
        permission="delete_user" 
        fallback={<p>You don't have permission to delete users.</p>}
      >
        <div>
          <h3>Delete User Section</h3>
          <p>This content is only visible to users with 'delete_user' permission.</p>
          <button>Delete User</button>
        </div>
      </PermissionGuard>

      {/* Example 7: Using the hook directly in component logic */}
      <div>
        <h3>Dynamic Content Based on Permissions</h3>
        {checkPermission('read_dashboard') && (
          <p>Dashboard access granted!</p>
        )}
        
        {hasRole('teacher') && (
          <p>Teacher-specific content here.</p>
        )}
        
        {permissions.length > 0 && (
          <p>You have {permissions.length} permissions.</p>
        )}
      </div>
    </div>
  );
}; 