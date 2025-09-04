import React from 'react';
import './Input.scss';

interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time' | 'file';
    label?: string;
    name: string;
    value?: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    icon?:string;
    labelFont?:number;
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
    className = '',
    icon,
    labelFont=20
}) => {
    
    return (
        <div className={`input-container ${className}`}>
            {label && (
                <label htmlFor={name} className="input-label" style={{fontSize:labelFont}}>
                {icon && <img 
                src={icon} 
                alt="icon" 
                style={{ 
                  width: 19, 
                  height: 19, 
                  marginRight: 8,
                  filter: `var(--icon-filter)`,
                  fill: 'var(--main-text)'
                }} 
                />}
                {label}
                {required && <span className="required">*</span>}
              </label>
            )}
            <input
              type={type}
              id={name}
              name={name}
              {...(type !== 'file' ? { value } : {})}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              className={`input-field ${error ? 'error' : ''}`}
              autoComplete={name === 'pin' ? 'off' : undefined}
            />
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default Input; 