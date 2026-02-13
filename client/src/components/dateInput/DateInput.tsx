import React, { useState, useEffect, useRef } from 'react';
import './DateInput.scss';
import { formatDateDisplay, parseDDMMYYYYToYYYYMMDD } from '../../functions/formatDate';

// Helper: normalize value to YYYY-MM-DD for storage/API
const toYYYYMMDD = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    if (date.includes('T')) return date.split('T')[0];
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    return '';
  }
  if (date instanceof Date) return date.toISOString().split('T')[0];
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
  placeholder = 'dd/mm/yyyy',
  error,
  required = false,
  disabled = false,
  className = '',
  icon,
  labelFont = 'var(--label-font-size)',
  min,
  max,
}) => {
  // Store value as YYYY-MM-DD for parent/API; display as dd/mm/yyyy
  const [internalValue, setInternalValue] = useState<string>(toYYYYMMDD(value));
  const [displayValue, setDisplayValue] = useState<string>(() => formatDateDisplay(internalValue || undefined));
  const pickerRef = useRef<HTMLInputElement>(null);

  // Sync when external value changes (e.g. from fetch)
  useEffect(() => {
    const next = toYYYYMMDD(value);
    setInternalValue(next);
    setDisplayValue(formatDateDisplay(next || undefined));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const parsed = parseDDMMYYYYToYYYYMMDD(raw);
    if (parsed) setInternalValue(parsed);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseDDMMYYYYToYYYYMMDD(displayValue);
    if (parsed) {
      setInternalValue(parsed);
      setDisplayValue(formatDateDisplay(parsed));
      const syntheticEvent = {
        ...e,
        target: { ...e.target, name, value: parsed },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      setDisplayValue(formatDateDisplay(internalValue || undefined));
    }
    if (onBlur) onBlur(e);
  };

  const openPicker = () => {
    pickerRef.current?.showPicker?.();
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v) {
      setInternalValue(v);
      setDisplayValue(formatDateDisplay(v));
      onChange(e);
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
      <div className="date-input-wrapper">
        <input
          type="text"
          id={name}
          name={name}
          value={displayValue}
          onChange={handleTextChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`date-input-field ${error ? 'error' : ''}`}
          inputMode="numeric"
          autoComplete="off"
        />
        <input
          ref={pickerRef}
          type="date"
          aria-hidden="true"
          tabIndex={-1}
          value={internalValue}
          onChange={handlePickerChange}
          min={min}
          max={max}
          disabled={disabled}
          className="date-input-picker-native"
        />
        <button
          type="button"
          className="date-input-picker-btn"
          onClick={openPicker}
          disabled={disabled}
          title="Choose date"
          tabIndex={-1}
        />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

DateInput.displayName = 'DateInput';

export default DateInput;