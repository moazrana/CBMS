import React from 'react';
import './Input.scss';

interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
    label?: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

const Input: React.FC<InputProps> = ({
    type = 'text',
    label,
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={`input-container ${className}`}>
            {label && (
              <label htmlFor={name} className="input-label">
                {label}
                {required && <span className="required">*</span>}
              </label>
            )}
            <input
              type={type}
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              className={`input-field ${error ? 'error' : ''}`}
            />
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default Input; 