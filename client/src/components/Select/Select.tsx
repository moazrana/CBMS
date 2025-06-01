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
    options: Option[];
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

const Select: React.FC<SelectProps> = ({
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    error,
    required = false,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={`select-container ${className}`}>
            {label && (
                <label htmlFor={name} className="select-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`select-field ${error ? 'error' : ''}`}
            >
                {placeholder && (
                    <option value="" disabled>
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