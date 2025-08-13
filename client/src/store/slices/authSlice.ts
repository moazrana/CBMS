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

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
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
      localStorage.setItem('token', action.payload.access_token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.user?.permissions || [];
export const selectLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;

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