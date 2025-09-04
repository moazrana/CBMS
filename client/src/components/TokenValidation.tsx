import React from 'react';
import { useTokenValidation } from '../hooks/useTokenValidation';

interface TokenValidationProps {
  children: React.ReactNode;
  showLoading?: boolean;
  redirectToLogin?: boolean;
}

export const TokenValidation: React.FC<TokenValidationProps> = ({
  children,
  showLoading = true,
  redirectToLogin = true,
}) => {
  const { isValid, isLoading, error, isExpiringSoon } = useTokenValidation();

  if (isLoading && showLoading) {
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

  if (!isValid) {
    if (redirectToLogin) {
      return null; // Let the hook handle navigation
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Authentication Required</h2>
        <p>{error || 'Please log in to continue'}</p>
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      {isExpiringSoon && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: '#ffc107',
          color: '#000',
          padding: '10px 15px',
          borderRadius: '5px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          ⚠️ Your session will expire soon. Please save your work.
        </div>
      )}
      {children}
    </>
  );
};

export default TokenValidation; 