import React from 'react';
import { useRouteProtection } from '../hooks/useRouteProtection';
import { useSelector } from 'react-redux';
import { selectLoading } from '../store/slices/authSlice';
import { useLocation } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, tokenValidated, loading, isValidating } = useRouteProtection();
  const authLoading = useSelector(selectLoading);
  const location = useLocation();

  // Allow access to login page when not authenticated
  if (!isAuthenticated && location.pathname === '/login') {
    return <>{children}</>;
  }

  // Show loading spinner while validating token
  if (loading || isValidating || authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="loading-spinner"></div>
        <p>Validating authentication...</p>
      </div>
    );
  }

  // If not authenticated and not on login page, don't render anything
  // (the hook will handle navigation)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated but token not validated yet, show loading
  if (isAuthenticated && !tokenValidated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="loading-spinner"></div>
        <p>Loading user permissions...</p>
      </div>
    );
  }

  // If authenticated and token validated, render children
  return <>{children}</>;
};

export default RouteGuard; 