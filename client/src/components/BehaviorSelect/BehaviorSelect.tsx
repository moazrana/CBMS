import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './BehaviorSelect.scss';

export interface BehaviorOption {
    value: string;
    label: string;
    color: string;
}

interface BehaviorSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: BehaviorOption[];
    placeholder?: string;
    disabled?: boolean;
    name?: string;
}

const BehaviorSelect: React.FC<BehaviorSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Select Behavior',
    disabled = false,
    name
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleOptionClick = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`behavior-select ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
            <button 
                className="behavior-select-button" 
                onClick={handleToggle}
                disabled={disabled}
                type="button"
            >
                <span className="button-content">
                    {value ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: selectedOption.color,
                                    display: 'inline-block',
                                }}
                            />
                            {selectedOption.label}
                        </span>
                    ) : (
                        <span style={{ color: '#9ca3af' }}>{placeholder}</span>
                    )}
                </span>
                <FontAwesomeIcon icon={faChevronDown} className="chevron-icon" />
            </button>
            
            {isOpen && (
                <div className="behavior-select-list">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`behavior-select-option ${value === option.value ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option.value)}
                            type="button"
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: option.color,
                                        display: 'inline-block',
                                    }}
                                />
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            {name && <input type="hidden" name={name} value={value} />}
        </div>
    );
};

export default BehaviorSelect;

