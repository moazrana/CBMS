import api from './api';
import { store } from '../store/store';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout,
  tokenValidationStart,
  tokenValidationSuccess,
  tokenValidationFailure
} from '../store/slices/authSlice';

interface LoginCredentials {
  email: string;
  password: string;
  pin: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: Array<{
      name: string;
    }>;
  };
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

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      store.dispatch(loginStart());
      
      const response = await api.post<LoginResponse>('/api/auth/login', credentials);
      
      store.dispatch(loginSuccess(response.data));
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      store.dispatch(loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    store.dispatch(logout());
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Check if token is expired (basic check)
  isTokenExpired: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  // Comprehensive token validation with permissions
  validateToken: async (): Promise<TokenValidationResponse> => {
    const token = localStorage.getItem('token');
    
    // First check if token exists
    if (!token) {
      throw new Error('No token found');
    }

    // Check if token is expired on client side
    if (authService.isTokenExpired()) {
      localStorage.removeItem('token');
      throw new Error('Token is expired');
    }

    try {
      store.dispatch(tokenValidationStart());
      
      // Validate token with server
      const response = await api.get<TokenValidationResponse>('/auth/validate');
      
      if (response.data.valid) {
        store.dispatch(tokenValidationSuccess(response.data));
        return response.data;
      } else {
        throw new Error('Token validation failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Token validation failed';
      store.dispatch(tokenValidationFailure(errorMessage));
      
      // If server returns 401, token is invalid
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      
      throw new Error(errorMessage);
    }
  },

  // Get token payload (decoded)
  getTokenPayload: (): any => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  },

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
      return payload.exp * 1000 < fiveMinutesFromNow;
    } catch {
      return true;
    }
  }
}; 