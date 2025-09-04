import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  selectIsAuthenticated, 
  selectTokenValidated, 
  selectLoading,
  tokenValidationFailure 
} from '../store/slices/authSlice';

export const useRouteProtection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const tokenValidated = useSelector(selectTokenValidated);
  const loading = useSelector(selectLoading);
  
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateTokenOnRefresh = async () => {
      // Skip validation for login route
      if (location.pathname === '/login') {
        return;
      }

      // If we have a token but haven't validated it yet, or if we're on a protected route
      if (isAuthenticated && !tokenValidated && !isValidating) {
        setIsValidating(true);
        
        try {
          await authService.validateToken();
          // Token validation successful - permissions are now in Redux
        } catch (error: any) {
          console.error('Token validation failed:', error.message);
          dispatch(tokenValidationFailure(error.message));
          navigate('/login', { replace: true });
        } finally {
          setIsValidating(false);
        }
      }
    };

    validateTokenOnRefresh();
  }, [location.pathname, isAuthenticated, tokenValidated, isValidating, navigate, dispatch]);

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login' && !loading && !isValidating) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, loading, isValidating, navigate]);

  return {
    isAuthenticated,
    tokenValidated,
    loading: loading || isValidating,
    isValidating
  };
}; 