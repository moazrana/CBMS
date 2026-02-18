import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SearchableMultiSelect.scss';

export interface SearchableMultiSelectOption {
  value: string | number;
  label: string;
}

interface SearchableMultiSelectProps {
  label?: string;
  name: string;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options: SearchableMultiSelectOption[];
  onSearch: (term: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: string;
}

const DEBOUNCE_MS = 300;

export const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const valueSet = new Set(value.map((v) => String(v)));
  const selectedLabels = value.map((v) => options.find((o) => String(o.value) === String(v))?.label ?? String(v));
  const displayText =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? selectedLabels.join(', ')
        : `${value.length} selected`;

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

  const toggleOption = (option: SearchableMultiSelectOption) => {
    const has = value.some((v) => String(v) === String(option.value));
    if (has) {
      onChange(value.filter((v) => String(v) !== String(option.value)));
    } else {
      onChange([...value, option.value]);
    }
  };

  const handleInputFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    if (searchTerm === '') handleSearchChange('');
  };

  return (
    <div className={`searchable-multi-select-container ${className}`} ref={containerRef}>
      {label && (
        <label className="searchable-multi-select-label">
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
        className="searchable-multi-select-trigger"
      >
        <span className={value.length === 0 ? 'placeholder' : ''}>{displayText}</span>
        <span className="searchable-multi-select-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="searchable-multi-select-dropdown">
          <div className="searchable-multi-select-search-wrap">
            <input
              type="text"
              className="searchable-multi-select-search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearchChange(e.target.value);
              }}
              onFocus={handleInputFocus}
              autoComplete="off"
            />
          </div>
          <ul className="searchable-multi-select-list" role="listbox">
            {options.length === 0 ? (
              <li className="searchable-multi-select-option empty">No results</li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={valueSet.has(String(option.value))}
                  className={`searchable-multi-select-option ${valueSet.has(String(option.value)) ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleOption(option);
                  }}
                >
                  <span className="searchable-multi-select-check">{valueSet.has(String(option.value)) ? '✓' : ''}</span>
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableMultiSelect;
