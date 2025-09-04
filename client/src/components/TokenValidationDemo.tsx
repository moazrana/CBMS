import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useTokenValidation } from '../hooks/useTokenValidation';

const TokenValidationDemo: React.FC = () => {
  const { isValid, isLoading, error, user, isExpiringSoon, validateToken } = useTokenValidation();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<string>('');

  useEffect(() => {
    // Get token information
    const payload = authService.getTokenPayload();
    setTokenInfo(payload);
  }, []);

  const handleManualValidation = async () => {
    try {
      const result = await validateToken();
      setValidationResult(result ? 'Token is valid!' : 'Token is invalid!');
    } catch (error: any) {
      setValidationResult(`Validation failed: ${error.message}`);
    }
  };

  const handleCheckExpiration = () => {
    const isExpired = authService.isTokenExpired();
    const isExpiringSoon = authService.isTokenExpiringSoon();
    
    if (isExpired) {
      setValidationResult('Token is expired!');
    } else if (isExpiringSoon) {
      setValidationResult('Token will expire soon!');
    } else {
      setValidationResult('Token is not expiring soon.');
    }
  };

  if (isLoading) {
    return <div>Loading token validation...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>JWT Token Validation Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Token Status</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: isValid ? '#d4edda' : '#f8d7da', 
          border: `1px solid ${isValid ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          <p><strong>Valid:</strong> {isValid ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Loading:</strong> {isLoading ? '🔄 Yes' : '✅ No'}</p>
          <p><strong>Expiring Soon:</strong> {isExpiringSoon ? '⚠️ Yes' : '✅ No'}</p>
          {error && <p><strong>Error:</strong> {error}</p>}
        </div>
      </div>

      {tokenInfo && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Token Information</h2>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #dee2e6',
            borderRadius: '5px'
          }}>
            <p><strong>User ID:</strong> {tokenInfo.sub}</p>
            <p><strong>Email:</strong> {tokenInfo.email}</p>
            <p><strong>Role:</strong> {tokenInfo.role}</p>
            <p><strong>Issued At:</strong> {new Date(tokenInfo.iat * 1000).toLocaleString()}</p>
            <p><strong>Expires At:</strong> {new Date(tokenInfo.exp * 1000).toLocaleString()}</p>
            <p><strong>Time Remaining:</strong> {Math.max(0, Math.floor((tokenInfo.exp * 1000 - Date.now()) / 1000 / 60))} minutes</p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2>Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleManualValidation}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Validate Token
          </button>
          
          <button 
            onClick={handleCheckExpiration}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Check Expiration
          </button>
          
          <button 
            onClick={() => {
              const isExpired = authService.isTokenExpired();
              alert(`Token expired: ${isExpired}`);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Is Expired?
          </button>
          
          <button 
            onClick={() => {
              const payload = authService.getTokenPayload();
              console.log('Token payload:', payload);
              alert('Check console for token payload');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Get Payload
          </button>
        </div>
      </div>

      {validationResult && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Validation Result</h2>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e2e3e5', 
            border: '1px solid #d6d8db',
            borderRadius: '5px'
          }}>
            {validationResult}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2>Usage Examples</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '5px'
        }}>
          <h3>1. Basic Token Check</h3>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '3px' }}>
{`// Check if user is authenticated
const isAuth = authService.isAuthenticated();

// Check if token is expired
const isExpired = authService.isTokenExpired();`}
          </pre>

          <h3>2. Server-Side Validation</h3>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '3px' }}>
{`// Validate token with server
const isValid = await authService.validateToken();`}
          </pre>

          <h3>3. Using the Hook</h3>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '3px' }}>
{`// In your component
const { isValid, isLoading, error, user } = useTokenValidation();`}
          </pre>

          <h3>4. Protecting Routes</h3>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '3px' }}>
{`// Wrap your protected content
<TokenValidation>
  <YourProtectedComponent />
</TokenValidation>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TokenValidationDemo; 