import React, { useState } from 'react';
import Input from './Input';
import { useApiRequest } from '../hooks/useApiRequest';
import './LoginForm.css';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

const LoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const { executeRequest, error: apiError } = useApiRequest<LoginResponse>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<LoginFormData> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await executeRequest('post', '/auth/login', formData);
        console.log('Login successful:', response);
        
        // Store the token in localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // You can redirect to dashboard or home page here
        // For example: navigate('/dashboard');
      } catch (error) {
        // Error is already handled by the useApiRequest hook
        console.error('Login error:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      {apiError && <div className="error-message global-error">{apiError}</div>}
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Enter your email"
      />
      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter your password"
      />
      <button 
        type="submit" 
        className="submit-button"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm; 