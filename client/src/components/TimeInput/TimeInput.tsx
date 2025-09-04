import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './TimeInput.scss';

interface TimeInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    disabled?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({
    value,
    onChange,
    min = 0,
    max = 60,
    step = 1,
    suffix = 'Mins',
    disabled = false
}) => {
    const handleIncrement = () => {
        if (!disabled && value + step <= max) {
            onChange(value + step);
        }
    };

    const handleDecrement = () => {
        if (!disabled && value - step >= min) {
            onChange(value - step);
        }
    };

    return (
        <div className={`time-input ${disabled ? 'disabled' : ''}`}>
            <span className="time-value">{value}{suffix}</span>
            <div className="time-controls">
                <button 
                    className="control-btn up" 
                    onClick={handleIncrement}
                    disabled={disabled || value + step > max}
                >
                    <FontAwesomeIcon icon={faChevronUp} />
                </button>
                <button 
                    className="control-btn down" 
                    onClick={handleDecrement}
                    disabled={disabled || value - step < min}
                >
                    <FontAwesomeIcon icon={faChevronDown} />
                </button>
            </div>
        </div>
    );
};

export default TimeInput; 