import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../input/Input';
import './LoginForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield } from '@fortawesome/free-solid-svg-icons';
import { authService } from '../../services/authService';
import { useAppSelector } from '../../store/hooks';

interface LoginFormData {
  email: string;
  password: string;
  pin: string;
}

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    pin: ''
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const { loading, error: authError } = useAppSelector(state => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await authService.login(formData);
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        // Error is already handled by Redux
      }
    }
  };

  return (
    <div className="login-container">
      <img src="/logo.svg" alt="Logo" style={{ width: 60, height: 50, marginTop: 32, marginLeft: 10 }} />
      <div className="login-div">
        <div className="login-left">
          <h1>Transform Behaviour With Insight.</h1>
          <p>Enter Your Email To Get Access!</p>
          
          {authError && <div className="error-message global-error">{authError}</div>}
          
          <Input
            label=""
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter Your Username..."
          />
          <Input
            label=""
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter Your Passcode..."
          />
          <Input
            label=""
            type="password"
            name="pin"
            value={formData.pin}
            onChange={handleChange}
            error={errors.pin}
            placeholder="Enter Your PIN..."
          />
          <button 
            onClick={handleSubmit} 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Done'}
          </button>
          
          <div className="contact-admin">
            <div className="or-div">
              <span className='hr-div'><hr /></span>
              <span className='or-text'>OR</span>
              <span className='hr-div'><hr /></span>
            </div>
            <button className="admin-button">
              <FontAwesomeIcon icon={faUserShield} style={{ marginRight: 8 }} />
              Contact Administrator
            </button>
          </div>
        </div>
        <div className="login-right">
          <img src="/loginRight.png" alt="Login Visual" />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;