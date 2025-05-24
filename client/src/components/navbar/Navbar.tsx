import React from 'react';
import './Navbar.scss'; // or .scss
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { faGear,faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-search">
        <span className="navbar-search-icon">
          <FontAwesomeIcon className='nav-icon' icon={faMagnifyingGlass} />
        </span>
        <input type="text" placeholder="Search anything here..." />
      </div>
      <div className="navbar-actions">
        <div className="navbar-actions-left">
          <button className="navbar-icon"><FontAwesomeIcon className='nav-icon' icon={faBell} /></button>
          <button className="navbar-icon"><FontAwesomeIcon className='nav-icon' icon={faGear} /></button>
        </div>
        
        <div className="navbar-profile">
        <div className="navbar-divider"></div>
          <img src="/avatar.png" alt="Avatar" className="navbar-avatar" />
          <div>
            <div className="navbar-name">{JSON.parse(localStorage.getItem('user') || '{}').name || 'Guest'}</div>
            <div className="navbar-role">{JSON.parse(localStorage.getItem('user') || '{}').role || 'Guest'}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
