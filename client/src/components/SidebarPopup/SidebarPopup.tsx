import React, { ReactNode } from 'react';
import open from '../../assets/rightSideBar/open.svg'
import beat from '../../assets/safeguarding/beat.svg'
import { useNavigate } from 'react-router-dom';
import './SidebarPopup.scss';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  pinkBoxText?:string;
  grayBoxText?:string;
  confirmText?: string;
  cancelText?: string;
  children?: ReactNode;
  width?: string;
  height?: string;
  footer?:ReactNode;
  link?:string;
}

const SidebarPopup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  pinkBoxText,
  grayBoxText,
  children,
  width = '500px',
  footer,
  link
}) => {
  const navigate=useNavigate()
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div 
        className="side-popup-content" 
        onClick={e => e.stopPropagation()}
        style={{ width}}
      >
        <div className="popup-header">
          <div className="sidebar-title">
            <p className="side-popup-title">{title}</p>
            { message && <p className='message'>{message}</p>}
          </div>
          <div className="side-title-div">
            {pinkBoxText&&<div className='pink-container'><div className="b-day-box">{pinkBoxText} </div></div>}
            {grayBoxText&&<div className="gray-box">{grayBoxText} </div>}
          </div>
        </div>
        <div className="side-popup-body">
          <div className='uppper-body-btns'>
            <div className="status-div">
              <img src={beat} alt="icon" style={{ width: 15, height: 15, marginRight: 8,filter: 'var(--status-color)' }} />Open
            </div>
            <div className="open-link"  onClick={() => link &&navigate(link)} style={{ cursor: 'pointer' }}>
              <img 
                src={open} 
                alt="icon" 
                style={{ width: 19, height: 19, marginRight: 8,filter:'var(--icon-filter)' }} 
              />
            </div>
          </div>
          {children}
        </div>
        <div className="popup-footer">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default SidebarPopup; 