import React from 'react';
import './Select.scss';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    label?: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
    options: Option[];
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: string; // SVG or image path
}

const Select: React.FC<SelectProps> = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    options,
    placeholder,
    error,
    required = false,
    disabled = false,
    className = '',
    icon
}) => {
    return (
        <div className={`select-container ${className}`}>
            {label && (
                <label htmlFor={name} className="select-label">
                    {icon && <img src={icon} alt="icon" style={{ width: 19, height: 19, marginRight: 8,filter:'var(--icon-filter)' }} />}
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={`select-field ${error ? 'error' : ''}`}
                >
                    {placeholder && (
                        <option value="">
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default Select; 