import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGauge,
  faTriangleExclamation,
  faUserShield,
  faCalendarCheck,
  faChartColumn,
  faBookBookmark,
  faCircleExclamation,
  faAddressCard,
  faBullseye, 
  faGear 
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.scss';
import logo from '/logo.png';
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center',marginLeft:'25px' }}>
        <img src={logo} alt="logo" style={{ width: 50, height: 50 }} />
        <span style={{ marginLeft: 0 }}>Tracklio</span>
      </div>
      <nav className="sidebar-nav">
        <h4 className="sidebar-text">CORE OPERATIONS</h4>
        
        <Link to="/" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faGauge} />Dashboard
          </div>
        </Link>
        
        <Link to="/users" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faTriangleExclamation} />Incidents
          </div>
        </Link>
        
        <Link to="/safeguarding" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faUserShield} />Safeguarding
          </div>
        </Link>
        
        <Link to="/attendance" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faCalendarCheck} />Attendance
          </div>
        </Link>
        
        <Link to="/sbt" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faChartColumn} />Student Behavior Trends
          </div>
        </Link>
        <hr />
        {/* ********************************************* */}
        <h4 className="sidebar-text">ACADEMIC & CLASS MANAGEMENT</h4>
        
        <Link to="/classes" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faBookBookmark} />Classes
          </div>
        </Link>

        <Link to="/classes" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faCircleExclamation} />Reports
          </div>
        </Link>
        <hr />
        {/* ********************************************* */}
        <h4 className="sidebar-text">USER & STAFF MANAGEMENT</h4>
        <Link to="/users" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faAddressCard} />Users
          </div>
        </Link>
        
        <Link to="/users" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faBullseye} />Compliance
          </div>
        </Link>
        <hr />
        {/* ********************************************* */}
        <h4 className="sidebar-text">CONFIGURATIONS</h4>
        <Link to="/users" style={{color:'#ffffff'}} className="sidebar-text sidebar-link">
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faGear} />Settings
          </div>
        </Link>
        
        
      </nav>
    </aside>
  );
}
