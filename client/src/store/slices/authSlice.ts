import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Permission {
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
}

interface TokenValidationResponse {
  valid: boolean;
  user: {
    _id: string;
    email: string;
    role: string;
    name: string;
  };
  permissions: string[];
  message: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokenValidated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  tokenValidated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; access_token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.error = null;
      state.tokenValidated = true;
      localStorage.setItem('token', action.payload.access_token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.tokenValidated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.tokenValidated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    tokenValidationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    tokenValidationSuccess: (state, action: PayloadAction<TokenValidationResponse>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.tokenValidated = true;
      state.user = {
        id: action.payload.user._id,
        name: action.payload.user.name,
        email: action.payload.user.email,
        role: action.payload.user.role,
        permissions: action.payload.permissions.map(name => ({ name }))
      };
      state.error = null;
    },
    tokenValidationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.tokenValidated = false;
      state.error = action.payload;
      localStorage.removeItem('token');
    },
    updatePermissions: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.permissions = action.payload.map(name => ({ name }));
      }
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError,
  tokenValidationStart,
  tokenValidationSuccess,
  tokenValidationFailure,
  updatePermissions
} = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.user?.permissions || [];
export const selectLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectTokenValidated = (state: { auth: AuthState }) => state.auth.tokenValidated;

// Permission helper functions
export const hasPermission = (state: { auth: AuthState }, permissionName: string): boolean => {
  const permissions = state.auth.user?.permissions || [];
  return permissions.some(permission => permission.name === permissionName);
};

export const hasAnyPermission = (state: { auth: AuthState }, permissionNames: string[]): boolean => {
  const permissions = state.auth.user?.permissions || [];
  return permissionNames.some(permissionName => 
    permissions.some(permission => permission.name === permissionName)
  );
};

export const hasAllPermissions = (state: { auth: AuthState }, permissionNames: string[]): boolean => {
  const permissions = state.auth.user?.permissions || [];
  return permissionNames.every(permissionName => 
    permissions.some(permission => permission.name === permissionName)
  );
};

export default authSlice.reducer; 