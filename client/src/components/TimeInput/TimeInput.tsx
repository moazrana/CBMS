import React, { useState, useRef, useCallback } from 'react';
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
    onRapidChange?: (isRapid: boolean) => void; // New prop to detect rapid changes
}

const TimeInput: React.FC<TimeInputProps> = ({
    value,
    onChange,
    min = 0,
    max = 60,
    step = 1,
    suffix = 'Mins',
    disabled = false,
    onRapidChange
}) => {
    const [isRapidChanging, setIsRapidChanging] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const changeCountRef = useRef(0);

    const handleIncrement = useCallback(() => {
        if (!disabled && value + step <= max) {
            onChange(value + step);
            changeCountRef.current++;
            
            // Detect rapid changes (more than 3 changes in quick succession)
            if (changeCountRef.current > 3) {
                setIsRapidChanging(true);
                onRapidChange?.(true);
            }
        }
    }, [disabled, value, step, max, onChange, onRapidChange]);

    const handleDecrement = useCallback(() => {
        if (!disabled && value - step >= min) {
            onChange(value - step);
            changeCountRef.current++;
            
            // Detect rapid changes (more than 3 changes in quick succession)
            if (changeCountRef.current > 3) {
                setIsRapidChanging(true);
                onRapidChange?.(true);
            }
        }
    }, [disabled, value, step, min, onChange, onRapidChange]);

    const handleMouseDown = (direction: 'up' | 'down') => {
        if (disabled) return;
        
        // Reset change count
        changeCountRef.current = 0;
        
        // Initial click
        if (direction === 'up') {
            handleIncrement();
        } else {
            handleDecrement();
        }
        
        // Start interval for continuous changes
        intervalRef.current = setInterval(() => {
            if (direction === 'up') {
                handleIncrement();
            } else {
                handleDecrement();
            }
        }, 150); // Adjust speed as needed
        
        // Reset rapid change detection after 1 second of no changes
        timeoutRef.current = setTimeout(() => {
            changeCountRef.current = 0;
            setIsRapidChanging(false);
            onRapidChange?.(false);
        }, 1000);
    };

    const handleMouseUp = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        handleMouseUp();
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={`time-input ${disabled ? 'disabled' : ''} ${isRapidChanging ? 'rapid-changing' : ''}`}>
            <span className="time-value">{value}{suffix}</span>
            <div className="time-controls">
                <button 
                    className="control-btn up" 
                    onMouseDown={() => handleMouseDown('up')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    disabled={disabled || value + step > max}
                >
                    <FontAwesomeIcon icon={faChevronUp} />
                </button>
                <button 
                    className="control-btn down" 
                    onMouseDown={() => handleMouseDown('down')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    disabled={disabled || value - step < min}
                >
                    <FontAwesomeIcon icon={faChevronDown} />
                </button>
            </div>
        </div>
    );
};

export default TimeInput;