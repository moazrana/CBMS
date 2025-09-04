import React from 'react';
import { useSelector } from 'react-redux';
import { usePermissions } from '../hooks/usePermissions';
import { 
  selectIsAuthenticated, 
  selectTokenValidated, 
  selectLoading,
  selectUser 
} from '../store/slices/authSlice';

const RouteProtectionDemo: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const tokenValidated = useSelector(selectTokenValidated);
  const loading = useSelector(selectLoading);
  const user = useSelector(selectUser);
  const { permissions, checkPermission, hasRole } = usePermissions();

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Route Protection & Permissions Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Authentication Status</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: isAuthenticated ? '#d4edda' : '#f8d7da', 
          border: `1px solid ${isAuthenticated ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Token Validated:</strong> {tokenValidated ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</p>
        </div>
      </div>

      {user && (
        <div style={{ marginBottom: '20px' }}>
          <h2>User Information</h2>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #dee2e6',
            borderRadius: '5px'
          }}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        </div>
      )}

      {permissions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>User Permissions</h2>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e7f3ff', 
            border: '1px solid #b3d9ff',
            borderRadius: '5px'
          }}>
            <p><strong>Total Permissions:</strong> {permissions.length}</p>
            <div style={{ marginTop: '10px' }}>
              <strong>Permissions:</strong>
              <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
                {permissions.map((permission, index) => (
                  <li key={index}>{permission.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2>Permission Checks</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '5px'
        }}>
          <h3>Role Checks</h3>
          <p><strong>Is Admin:</strong> {hasRole('admin') ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Is Teacher:</strong> {hasRole('teacher') ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Is Student:</strong> {hasRole('student') ? '✅ Yes' : '❌ No'}</p>
          
          <h3 style={{ marginTop: '15px' }}>Permission Checks</h3>
          <p><strong>Can View Dashboard:</strong> {checkPermission('view_dashboard') ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Can Manage Users:</strong> {checkPermission('manage_users') ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Can Manage Roles:</strong> {checkPermission('manage_roles') ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Can View Incidents:</strong> {checkPermission('view_incidents') ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Can Create Incidents:</strong> {checkPermission('create_incidents') ? '✅ Yes' : '❌ No'}</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Route Protection Features</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '5px'
        }}>
          <h3>✅ Implemented Features</h3>
          <ul>
            <li><strong>Token Validation on Refresh:</strong> Every page refresh validates the token</li>
            <li><strong>Permission Fetching:</strong> Backend returns user permissions on validation</li>
            <li><strong>Redux Integration:</strong> Permissions stored in Redux state</li>
            <li><strong>Automatic Redirect:</strong> Invalid tokens redirect to /login</li>
            <li><strong>Loading States:</strong> Shows loading while validating</li>
            <li><strong>Route Protection:</strong> All non-login routes are protected</li>
          </ul>
          
          <h3 style={{ marginTop: '15px' }}>🔄 How It Works</h3>
          <ol>
            <li>User visits any non-login route</li>
            <li>RouteGuard checks if token exists</li>
            <li>If token exists, validates with backend</li>
            <li>Backend returns user info + permissions</li>
            <li>Permissions stored in Redux</li>
            <li>User can access the route</li>
            <li>If token invalid, redirects to /login</li>
          </ol>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Usage Examples</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e9ecef', 
          border: '1px solid #ced4da',
          borderRadius: '5px'
        }}>
          <h3>1. Check Permissions in Components</h3>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '3px' }}>
{`import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const { checkPermission, hasRole } = usePermissions();
  
  if (!checkPermission('view_dashboard')) {
    return <div>Access denied</div>;
  }
  
  return <div>Dashboard content</div>;
}`}
          </pre>

          <h3>2. Conditional Rendering</h3>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '3px' }}>
{`{checkPermission('manage_users') && (
  <button>Manage Users</button>
)}

{hasRole('admin') && (
  <div>Admin only content</div>
)}`}
          </pre>

          <h3>3. Route Protection</h3>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '3px' }}>
{`// App.tsx - All routes are automatically protected
<RouteGuard>
  <Routes>
    <Route path="/login" element={<LoginForm />} />
    <Route path="/dashboard" element={<Dashboard/>}/>
    {/* All other routes are protected */}
  </Routes>
</RouteGuard>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default RouteProtectionDemo; 