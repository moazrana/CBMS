# JWT Token Validation System

This document explains the comprehensive JWT token validation system implemented in the CBMS application.

## Overview

The JWT token validation system provides both client-side and server-side validation of authentication tokens, ensuring secure access to protected resources.

## Features

- ✅ **Client-side token expiration check**
- ✅ **Server-side token validation**
- ✅ **Automatic token refresh handling**
- ✅ **Real-time token status monitoring**
- ✅ **Expiration warnings**
- ✅ **Automatic logout on invalid tokens**
- ✅ **Route protection components**

## Server-Side Implementation

### 1. Token Validation Endpoint

A new endpoint has been added to validate tokens:

```typescript
// GET /auth/validate
@Get('validate')
@UseGuards(JwtAuthGuard)
async validateToken(@Request() req) {
  return {
    valid: true,
    user: req.user,
    message: 'Token is valid'
  };
}
```

### 2. JWT Strategy

The existing JWT strategy validates tokens and returns user information:

```typescript
// server/src/auth/strategies/jwt.strategy.ts
async validate(payload: any) {
  const user = await this.usersService.findOne(payload.sub);
  
  return {
    _id: user._id,
    email: user.email,
    role: user.role.name
  };
}
```

## Client-Side Implementation

### 1. Enhanced Auth Service

The `authService` now includes comprehensive token validation methods:

```typescript
// client/src/services/authService.ts

// Check if token is expired
isTokenExpired(): boolean

// Validate token with server
validateToken(): Promise<boolean>

// Get token payload (decoded)
getTokenPayload(): any

// Check if token will expire soon (within 5 minutes)
isTokenExpiringSoon(): boolean
```

### 2. Token Validation Hook

A custom hook provides real-time token validation:

```typescript
// client/src/hooks/useTokenValidation.ts
const { isValid, isLoading, error, user, isExpiringSoon, validateToken } = useTokenValidation();
```

**Features:**
- Automatic validation on component mount
- Periodic validation every 5 minutes
- Expiration warnings
- Automatic logout on invalid tokens

### 3. Token Validation Component

A wrapper component for protecting routes:

```typescript
// client/src/components/TokenValidation.tsx
<TokenValidation>
  <YourProtectedComponent />
</TokenValidation>
```

### 4. Enhanced API Interceptor

The API interceptor now handles token validation automatically:

```typescript
// client/src/services/api.ts
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  
  if (token && !authService.isTokenExpired()) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && authService.isTokenExpired()) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  return config;
});
```

## Usage Examples

### 1. Basic Token Check

```typescript
import { authService } from '../services/authService';

// Check if user is authenticated
const isAuth = authService.isAuthenticated();

// Check if token is expired
const isExpired = authService.isTokenExpired();

// Get token payload
const payload = authService.getTokenPayload();
```

### 2. Server-Side Validation

```typescript
// Validate token with server
const isValid = await authService.validateToken();
```

### 3. Using the Hook

```typescript
import { useTokenValidation } from '../hooks/useTokenValidation';

function MyComponent() {
  const { isValid, isLoading, error, user, isExpiringSoon } = useTokenValidation();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isValid) return <div>Please log in</div>;
  
  return <div>Welcome, {user?.email}!</div>;
}
```

### 4. Protecting Routes

```typescript
import TokenValidation from '../components/TokenValidation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route 
          path="/dashboard" 
          element={
            <TokenValidation>
              <Dashboard />
            </TokenValidation>
          } 
        />
      </Routes>
    </Router>
  );
}
```

### 5. Manual Validation

```typescript
import { useTokenValidation } from '../hooks/useTokenValidation';

function MyComponent() {
  const { validateToken } = useTokenValidation();
  
  const handleValidate = async () => {
    const isValid = await validateToken();
    if (isValid) {
      console.log('Token is valid!');
    } else {
      console.log('Token is invalid!');
    }
  };
  
  return <button onClick={handleValidate}>Validate Token</button>;
}
```

## Token Information

The system provides access to token information:

```typescript
const payload = authService.getTokenPayload();
console.log({
  userId: payload.sub,
  email: payload.email,
  role: payload.role,
  issuedAt: new Date(payload.iat * 1000),
  expiresAt: new Date(payload.exp * 1000),
  timeRemaining: Math.floor((payload.exp * 1000 - Date.now()) / 1000 / 60) // minutes
});
```

## Error Handling

The system handles various error scenarios:

1. **Token not found**: Redirects to login
2. **Token expired**: Automatically removes token and redirects
3. **Server validation failed**: Handles 401/403 responses
4. **Network errors**: Graceful fallback

## Security Features

- **Automatic token cleanup**: Expired tokens are removed immediately
- **Server-side validation**: Every protected request validates the token
- **Fresh user data**: User information is fetched from database on each validation
- **Permission checking**: Role and permission validation on each request

## Demo Component

A demo component is available to test all features:

```typescript
// client/src/components/TokenValidationDemo.tsx
import TokenValidationDemo from '../components/TokenValidationDemo';

// Add to your routes for testing
<Route path="/token-demo" element={<TokenValidationDemo />} />
```

## Configuration

### Token Expiration

Token expiration is configured in the server:

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

Validation intervals can be adjusted in the hook:

```typescript
// client/src/hooks/useTokenValidation.ts
// Periodic validation (every 5 minutes)
setInterval(() => {
  if (authService.isAuthenticated()) {
    validateToken();
  }
}, 5 * 60 * 1000);

// Expiration check (every minute)
setInterval(() => {
  if (authService.isAuthenticated()) {
    checkTokenExpiration();
  }
}, 60 * 1000);
```

## Best Practices

1. **Always use the hook**: Use `useTokenValidation` for real-time validation
2. **Wrap protected routes**: Use `TokenValidation` component for route protection
3. **Handle loading states**: Show loading indicators while validating
4. **Provide user feedback**: Show expiration warnings to users
5. **Graceful degradation**: Handle network errors gracefully

## Troubleshooting

### Common Issues

1. **Token not being sent**: Check if token exists in localStorage
2. **Validation failing**: Check server logs for JWT errors
3. **User not found**: Ensure user exists in database
4. **Permission denied**: Check user role and permissions

### Debug Mode

Enable debug logging:

```typescript
// Add to your component
useEffect(() => {
  console.log('Token payload:', authService.getTokenPayload());
  console.log('Is expired:', authService.isTokenExpired());
  console.log('Is expiring soon:', authService.isTokenExpiringSoon());
}, []);
```

## API Reference

### authService Methods

- `isAuthenticated(): boolean` - Check if user is authenticated
- `getToken(): string | null` - Get current token
- `isTokenExpired(): boolean` - Check if token is expired
- `validateToken(): Promise<boolean>` - Validate token with server
- `getTokenPayload(): any` - Get decoded token payload
- `isTokenExpiringSoon(): boolean` - Check if token expires soon

### useTokenValidation Hook

- `isValid: boolean` - Token validation status
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message
- `user: any | null` - User information
- `isExpiringSoon: boolean` - Expiration warning
- `validateToken(): Promise<boolean>` - Manual validation
- `checkTokenExpiration(): void` - Check expiration

### TokenValidation Component Props

- `children: React.ReactNode` - Protected content
- `showLoading?: boolean` - Show loading indicator (default: true)
- `redirectToLogin?: boolean` - Auto-redirect on invalid token (default: true) 