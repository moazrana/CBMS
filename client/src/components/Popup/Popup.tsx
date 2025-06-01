import React, { ReactNode } from 'react';
import './Popup.scss';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  children?: ReactNode;
  width?: string;
  height?: string;
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  children,
  width = '500px',
  height = 'auto'
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div 
        className="popup-content" 
        onClick={e => e.stopPropagation()}
        style={{ width, height }}
      >
        <div className="popup-header">
          <h2 className="popup-title">{title}</h2>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          {message && <p>{message}</p>}
          {children}
          {onConfirm && (
            <div className="popup-footer">
              <button className="popup-button cancel" onClick={onClose}>
                {cancelText}
              </button>
              <button className="popup-button confirm" onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup; 