# Route Protection System with Token Validation & Permissions

This document explains the comprehensive route protection system that validates JWT tokens on every refresh and manages user permissions in Redux.

## 🎯 Overview

The route protection system ensures that:
- **Every non-login route validates the JWT token on refresh**
- **Backend returns user permissions on token validation**
- **Permissions are stored in Redux for easy access**
- **Invalid tokens automatically redirect to /login**
- **All routes are protected by default**

## 🏗️ Architecture

### Backend (Server-Side)

#### 1. Enhanced Token Validation Endpoint

```typescript
// GET /auth/validate
@Get('validate')
@UseGuards(JwtAuthGuard)
async validateToken(@Request() req) {
  // Get fresh user data with role and permissions
  const user = await this.usersService.findOneForLogin(req.user._id);
  
  return {
    valid: true,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role.name,
      name: user.name
    },
    permissions: user.role.permissions.map((permission: any) => permission.name),
    message: 'Token is valid'
  };
}
```

**Response Format:**
```json
{
  "valid": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "admin",
    "name": "John Doe"
  },
  "permissions": ["view_dashboard", "manage_users", "create_incidents"],
  "message": "Token is valid"
}
```

### Frontend (Client-Side)

#### 1. Enhanced Redux Store

The auth slice now includes:
- `tokenValidated` flag to track validation status
- New actions for token validation
- Permission management

```typescript
// New actions
tokenValidationStart: (state) => { /* ... */ }
tokenValidationSuccess: (state, action) => { /* ... */ }
tokenValidationFailure: (state, action) => { /* ... */ }
updatePermissions: (state, action) => { /* ... */ }
```

#### 2. Route Protection Hook

```typescript
// client/src/hooks/useRouteProtection.ts
export const useRouteProtection = () => {
  // Validates token on every route change
  // Handles automatic redirects
  // Manages loading states
}
```

#### 3. Route Guard Component

```typescript
// client/src/components/RouteGuard.tsx
<RouteGuard>
  <Routes>
    {/* All routes are protected */}
  </Routes>
</RouteGuard>
```

## 🚀 How It Works

### 1. User Visits Any Route (Except /login)

```typescript
// 1. RouteGuard checks if user is authenticated
if (!isAuthenticated && location.pathname !== '/login') {
  navigate('/login');
  return;
}

// 2. If authenticated but token not validated, validate it
if (isAuthenticated && !tokenValidated) {
  await authService.validateToken();
}
```

### 2. Token Validation Process

```typescript
// 1. Client-side expiration check
if (authService.isTokenExpired()) {
  throw new Error('Token is expired');
}

// 2. Server-side validation
const response = await api.get('/auth/validate');

// 3. Store permissions in Redux
store.dispatch(tokenValidationSuccess(response.data));
```

### 3. Permission Management

```typescript
// Permissions are automatically stored in Redux
const permissions = useSelector(selectPermissions);

// Easy permission checking
const { checkPermission, hasRole } = usePermissions();
```

## 📁 Files Created/Modified

### Backend
- **`server/src/auth/auth.controller.ts`** - Enhanced validation endpoint

### Frontend
- **`client/src/store/slices/authSlice.ts`** - Added token validation actions
- **`client/src/services/authService.ts`** - Enhanced validation with permissions
- **`client/src/hooks/useRouteProtection.ts`** - New route protection hook
- **`client/src/components/RouteGuard.tsx`** - New route guard component
- **`client/src/hooks/usePermissions.ts`** - Enhanced permissions hook
- **`client/src/App.tsx`** - Updated to use RouteGuard
- **`client/src/components/RouteProtectionDemo.tsx`** - Demo component

## 🎮 Usage Examples

### 1. Basic Route Protection

```typescript
// App.tsx - All routes are automatically protected
import RouteGuard from './components/RouteGuard';

function App() {
  return (
    <Router>
      <RouteGuard>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<Dashboard/>}/>
          {/* All other routes are protected */}
        </Routes>
      </RouteGuard>
    </Router>
  );
}
```

### 2. Check Permissions in Components

```typescript
import { usePermissions } from '../hooks/usePermissions';

function Dashboard() {
  const { checkPermission, hasRole } = usePermissions();
  
  if (!checkPermission('view_dashboard')) {
    return <div>Access denied</div>;
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {checkPermission('manage_users') && (
        <button>Manage Users</button>
      )}
      
      {hasRole('admin') && (
        <div>Admin only content</div>
      )}
    </div>
  );
}
```

### 3. Conditional Rendering Based on Permissions

```typescript
function Navigation() {
  const { checkPermission, hasRole } = usePermissions();
  
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      
      {checkPermission('manage_users') && (
        <Link to="/users">Users</Link>
      )}
      
      {checkPermission('manage_roles') && (
        <Link to="/roles">Roles</Link>
      )}
      
      {hasRole('admin') && (
        <Link to="/admin">Admin Panel</Link>
      )}
    </nav>
  );
}
```

### 4. Manual Token Validation

```typescript
import { authService } from '../services/authService';

async function refreshUserData() {
  try {
    const result = await authService.validateToken();
    console.log('User permissions:', result.permissions);
  } catch (error) {
    console.error('Token validation failed:', error.message);
  }
}
```

## 🔧 Configuration

### Token Expiration

```typescript
// server/src/auth/auth.module.ts
JwtModule.registerAsync({
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: '1d' }, // 1 day
  }),
})
```

### Validation Intervals

The system validates tokens:
- **On every route change** (for non-login routes)
- **On page refresh**
- **When token is not validated yet**

## 🛡️ Security Features

### 1. Automatic Token Cleanup
- Expired tokens are removed immediately
- Invalid tokens trigger automatic logout

### 2. Server-Side Validation
- Every protected request validates the token
- Fresh user data is fetched from database

### 3. Permission-Based Access Control
- Permissions are fetched on each validation
- Real-time permission checking

### 4. Secure Redirects
- Invalid tokens redirect to login
- Prevents access to protected routes

## 📊 Redux State Structure

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokenValidated: boolean; // New field
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[]; // Array of permissions
}

interface Permission {
  name: string;
}
```

## 🎯 Selectors

```typescript
// Basic selectors
selectUser: (state) => state.auth.user
selectToken: (state) => state.auth.token
selectIsAuthenticated: (state) => state.auth.isAuthenticated
selectPermissions: (state) => state.auth.user?.permissions || []
selectTokenValidated: (state) => state.auth.tokenValidated

// Permission helpers
hasPermission: (state, permissionName) => boolean
hasAnyPermission: (state, permissionNames) => boolean
hasAllPermissions: (state, permissionNames) => boolean
```

## 🧪 Testing

### Demo Component

Add the demo route to test the system:

```typescript
// App.tsx
<Route path="/route-demo" element={<RouteProtectionDemo />} />
```

Visit `/route-demo` to see:
- Authentication status
- User information
- Permissions list
- Permission checks
- Route protection features

### Manual Testing

1. **Login** - Should store token and permissions
2. **Refresh page** - Should validate token and restore permissions
3. **Invalid token** - Should redirect to login
4. **Permission checks** - Should work in components

## 🔄 Flow Diagram

```
User visits route
       ↓
RouteGuard checks authentication
       ↓
If not authenticated → Redirect to /login
       ↓
If authenticated but token not validated
       ↓
Call /auth/validate endpoint
       ↓
Backend validates token and returns permissions
       ↓
Store permissions in Redux
       ↓
Render protected route
```

## 🚨 Error Handling

### Common Scenarios

1. **Token not found**
   - Redirect to login
   - Clear any stored data

2. **Token expired**
   - Remove token from localStorage
   - Redirect to login
   - Show appropriate message

3. **Server validation failed**
   - Handle 401/403 responses
   - Clear invalid tokens
   - Redirect to login

4. **Network errors**
   - Graceful fallback
   - Retry mechanism
   - User-friendly messages

## 📈 Performance Considerations

### Optimizations

1. **Caching** - Permissions cached in Redux
2. **Lazy validation** - Only validate when needed
3. **Efficient checks** - Permission checks are O(1) lookups
4. **Minimal API calls** - Validate only on route changes

### Best Practices

1. **Use selectors** - Access Redux state efficiently
2. **Memoize components** - Prevent unnecessary re-renders
3. **Handle loading states** - Show appropriate UI feedback
4. **Error boundaries** - Catch and handle errors gracefully

## 🔮 Future Enhancements

### Potential Improvements

1. **Token refresh** - Automatic token renewal
2. **Permission caching** - Cache permissions for longer periods
3. **Role-based routing** - Dynamic route generation based on roles
4. **Audit logging** - Track permission checks and access attempts
5. **Real-time updates** - WebSocket for permission changes

## 📝 API Reference

### Backend Endpoints

- `GET /auth/validate` - Validate token and return permissions

### Frontend Hooks

- `useRouteProtection()` - Route protection logic
- `usePermissions()` - Permission checking utilities

### Components

- `RouteGuard` - Route protection wrapper
- `RouteProtectionDemo` - Demo component

### Redux Actions

- `tokenValidationStart()` - Start validation
- `tokenValidationSuccess(data)` - Validation successful
- `tokenValidationFailure(error)` - Validation failed
- `updatePermissions(permissions)` - Update permissions

This system provides a robust, secure, and user-friendly route protection mechanism that ensures proper authentication and authorization throughout your application. 