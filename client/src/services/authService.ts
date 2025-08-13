import api from './api';
import { store } from '../store/store';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';

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

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      store.dispatch(loginStart());
      
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
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
  }
}; 