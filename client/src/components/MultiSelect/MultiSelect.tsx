import React, { useState, useRef, useEffect } from 'react';
import './MultiSelect.scss';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSet = new Set(value);
  const displayText = value.length === 0
    ? placeholder
    : value.length <= 2
      ? value.map((v) => options.find((o) => o.value === v)?.label ?? v).join(', ')
      : `${value.length} selected`;

  const toggleOption = (optionValue: string) => {
    const next = new Set(value);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    onChange(Array.from(next));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`multi-select-container ${className}`} ref={containerRef}>
      {label && (
        <label className="multi-select-label">
          {icon && (
            <img
              src={icon}
              alt=""
              style={{ width: 19, height: 19, marginRight: 8, filter: 'var(--icon-filter)' }}
            />
          )}
          {label}
        </label>
      )}
      <button
        type="button"
        name={name}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="multi-select-trigger"
      >
        <span className={value.length === 0 ? 'placeholder' : ''}>{displayText}</span>
        <span className="multi-select-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="multi-select-dropdown">
          {options.map((option) => (
            <label key={option.value} className="multi-select-option">
              <input
                type="checkbox"
                checked={selectedSet.has(option.value)}
                onChange={() => toggleOption(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
