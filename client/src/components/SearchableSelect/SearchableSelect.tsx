import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SearchableSelect.scss';

export interface SearchableOption {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SearchableOption[];
  onSearch: (term: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: string;
  required?: boolean;
}

const DEBOUNCE_MS = 300;

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  onSearch,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  icon,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));
  const displayValue = selectedOption ? selectedOption.label : '';

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(term);
        searchTimeoutRef.current = null;
      }, DEBOUNCE_MS);
    },
    [onSearch],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleSelect = (option: SearchableOption) => {
    onChange(option.value);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    if (!value) handleSearchChange('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    setIsOpen(true);
    handleSearchChange('');
  };

  return (
    <div className={`searchable-select-container ${className}`} ref={containerRef}>
      {label && (
        <label className="searchable-select-label">
          {icon && (
            <img
              src={icon}
              alt=""
              style={{ width: 19, height: 19, marginRight: 8, filter: 'var(--icon-filter)' }}
            />
          )}
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="searchable-select-input-wrap">
        <input
          type="text"
          name={name}
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="searchable-select-input"
          autoComplete="off"
          readOnly={!isOpen && !!value}
        />
        {value && (
          <button
            type="button"
            className="searchable-select-clear"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>
      {isOpen && (
        <ul className="searchable-select-dropdown" role="listbox">
          {options.length === 0 ? (
            <li className="searchable-select-option empty">No results</li>
          ) : (
            options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={String(option.value) === String(value)}
                className={`searchable-select-option ${String(option.value) === String(value) ? 'selected' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;
