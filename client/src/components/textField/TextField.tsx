import React from 'react';
import './TextField.css';


interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
  icon?:string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
  icon
}) => {
  return (
    <div className="text-field">
      <label htmlFor={name}>
        {icon && 
          <img 
            src={icon} 
            alt="icon" 
            style={{ 
              width: 19, 
              height: 19, 
              marginRight: 8, 
              filter: `var(--icon-filter)`,
              fill: 'var(--main-text)', // This works for inline SVGs
            }} 
            
          />}
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? 'error' : ''}
        rows={rows}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default TextField; 