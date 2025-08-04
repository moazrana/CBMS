import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../input/Input';
import { useApiRequest } from '../../hooks/useApiRequest';
import './LoginForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield } from '@fortawesome/free-solid-svg-icons';
interface LoginFormData {
  email: string;
  password: string;
  pin:string
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    pin:''
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const { executeRequest, error: apiError } = useApiRequest<LoginResponse>();

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await executeRequest('post', '/auth/login', formData);
        if (response.access_token) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <div className="login-container">
      <img src="/logo.svg" alt="Logo" style={{ width: 60,height:50,marginTop:32, marginLeft: 10 }} />
      <div className="login-div">
        <div className="login-left">
          <h1>Transform Behaviour With Insight.</h1>
          <p>Enter Your Email To Get Access!</p>
          <form onSubmit={handleSubmit} className="login-form">
            {apiError && <div className="error-message global-error">{apiError}</div>}
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
            <button type="submit" className="submit-button">
              Done
            </button>
          </form>
          <div className="contact-admin">
            <div className="or-div">
              <span className='hr-div'><hr /></span>
              <span className='or-text'>OR</span>
              <span className='hr-div'><hr /></span>
            </div>
            <button className="admin-button"><FontAwesomeIcon icon={faUserShield} style={{ marginRight: 8 }} />Contact Administrator</button>
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