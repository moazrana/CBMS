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
  headerColor?: string;
  bodyColor?: string;
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
  height = 'auto',
  headerColor = 'var(--main-bg)',
  bodyColor = 'var(--main-bg)'
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div 
        className="popup-content" 
        onClick={e => e.stopPropagation()}
        style={{ width, height }}
      >
        <div className="popup-header" style={{ backgroundColor: headerColor }}>
          <h2 className="popup-title">{title}</h2>
          <div className="popup-close-div">
            <button className="popup-close" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="popup-body" style={{ backgroundColor: bodyColor }}>
          {message && <p>{message}</p>}
          {children}
        </div>
        <div className="popup-footerr">
        {onConfirm && (
          <>
            <div className="empty-div"></div>
            <button className="popup-btn cancel" onClick={onClose}>
                {cancelText}
            </button>
            <button className="popup-btn confirm" onClick={onConfirm}>
              {confirmText}
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default Popup; 