import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  selectIsAuthenticated, 
  selectTokenValidated, 
  selectLoading,
  selectUser,
  tokenValidationFailure 
} from '../store/slices/authSlice';

interface TokenValidationState {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  user: any | null;
}

export const useTokenValidation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const tokenValidated = useSelector(selectTokenValidated);
  const loading = useSelector(selectLoading);
  const user = useSelector(selectUser);
  
  const [state, setState] = useState<TokenValidationState>({
    isValid: false,
    isLoading: false,
    error: null,
    user: null,
  });

  const validateToken = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await authService.validateToken();
      setState({
        isValid: true,
        isLoading: false,
        error: null,
        user: result.user,
      });
      return result;
    } catch (error: any) {
      setState({
        isValid: false,
        isLoading: false,
        error: error.message || 'Token validation failed',
        user: null,
      });
      dispatch(tokenValidationFailure(error.message));
      navigate('/login');
      throw error;
    }
  }, [navigate, dispatch]);

  // Update state when Redux state changes
  useEffect(() => {
    setState({
      isValid: isAuthenticated && tokenValidated,
      isLoading: loading,
      error: null,
      user: user,
    });
  }, [isAuthenticated, tokenValidated, loading, user]);

  // Check if token is expiring soon and show warning
  const checkTokenExpiration = useCallback(() => {
    if (authService.isTokenExpiringSoon()) {
      // You could show a warning modal here
      console.warn('Token will expire soon. Please refresh your session.');
    }
  }, []);

  // Set up periodic expiration check (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (authService.isAuthenticated()) {
        checkTokenExpiration();
      }
    }, 60 * 1000); // 1 minute

    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  return {
    ...state,
    validateToken,
    checkTokenExpiration,
    isExpiringSoon: authService.isTokenExpiringSoon(),
    tokenValidated,
  };
}; 