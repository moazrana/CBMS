import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './AttendanceDropdown.scss';

export interface AttendanceOption {
    value: string;
    label: string;
    color: string;
}

interface AttendanceDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: AttendanceOption[];
    label?: string;
    disabled?: boolean;
}

const AttendanceDropdown: React.FC<AttendanceDropdownProps> = ({
    value,
    onChange,
    options,
    label,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        <div className={`attendance-dropdown ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
            {label && <label className="dropdown-label">{label}</label>}
            <button 
                className="dropdown-button" 
                onClick={handleToggle}
                disabled={disabled}
                style={{ 
                    background: `linear-gradient(90deg, ${selectedOption.color} 0%, ${selectedOption.color} 66%, #2a2a2a 66%, #2a2a2a 100%)`
                }}
            >
                <span className="button-text"></span>
                <FontAwesomeIcon icon={faChevronDown} className="chevron-icon" />
            </button>
            
            {isOpen && (
                <div className="dropdown-list">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option.value)}
                            style={{ backgroundColor: option.color }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendanceDropdown; 