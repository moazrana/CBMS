import React, { useState, useEffect } from 'react';
import './DateInput.scss';

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  if (typeof date === 'string') {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // If it's an ISO string, extract the date part
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    // Try to parse and format
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    return '';
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return '';
};

interface DateInputProps {
  label?: string;
  name: string;
  value?: string | Date | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: string;
  labelFont?: number;
  min?: string;
  max?: string;
}

const DateInput: React.FC<DateInputProps> = React.memo(({
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  icon,
  labelFont = 'var(--label-font-size)',
  min,
  max,
}) => {
  // Internal state for two-way binding (updates on change, syncs to parent on blur)
  const [internalValue, setInternalValue] = useState<string>(formatDateToYYYYMMDD(value));

  // Sync internal value when external value prop changes (e.g., from fetch)
  useEffect(() => {
    const formatted = formatDateToYYYYMMDD(value);
    setInternalValue(formatted);
  }, [value]);

  // Handle blur - sync to parent
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Create synthetic event with current internal value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: internalValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    
    // Call parent's onBlur if provided
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={`date-input-container ${className}`}>
      {label && (
        <label htmlFor={name} className="date-input-label" style={{ fontSize: labelFont }}>
          {icon && (
            <img
              src={icon}
              alt="icon"
              style={{
                width: 19,
                height: 19,
                marginRight: 8,
                filter: `var(--icon-filter)`,
                fill: 'var(--main-text)',
              }}
            />
          )}
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type="date"
        id={name}
        name={name}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onFocus={onFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className={`date-input-field ${error ? 'error' : ''}`}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

DateInput.displayName = 'DateInput';

export default DateInput;