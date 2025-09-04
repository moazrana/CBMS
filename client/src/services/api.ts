import axios from 'axios';
import { authService } from './authService';

const url=import.meta.env.VITE_BACKEND
// Create an axios instance with default config
const api = axios.create({
  baseURL: url, // Adjust this to your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    
    // Check if token exists and is not expired
    if (token && !authService.isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && authService.isTokenExpired()) {
      // Remove expired token
      localStorage.removeItem('token');
      // Redirect to login if we're not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response && error.response.status === 403) {
      console.error('Access denied: Insufficient permissions');
      // You could show a permission denied modal here
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  login: async (email: string, password: string) => {
    console.log(api.toString())
    return
    const response = await api.post('/auth/login', { email, password });
    // Store the token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    else{
      alert('wrong creds!!!')
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Validate token with server
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return response.data.valid;
    } catch {
      return false;
    }
  }
};

export default api; 