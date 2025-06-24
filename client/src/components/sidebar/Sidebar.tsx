import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import './sidebar.scss';
import logo from '/logo.png';
import dashboard from '../../assets/sidebar/dashboard.svg';
import incidents from '../../assets/sidebar/incidents.svg';
import safeguarding from '../../assets/sidebar/safeguarding.svg';
import attendance from '../../assets/sidebar/attendance.svg';
import studentBehavior from '../../assets/sidebar/studentBehavior.svg';
import classes from '../../assets/sidebar/classes.svg';
import reports from '../../assets/sidebar/reports.svg';
import users from '../../assets/sidebar/users.svg';
import compliance from '../../assets/sidebar/compliance.svg';
import settings from '../../assets/sidebar/settings.svg';

export default function Sidebar() {
  
  return (
    <aside className="sidebar" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', marginLeft: '25px' }}>
        <img src={logo} alt="logo" style={{ width: 50, height: 50 }} />
        <span style={{ marginLeft: 0, color: 'var(--sidebar-text)' }}>Tracklio</span>
      </div>
      <nav className="sidebar-nav">
        <h4 className="sidebar-text" style={{ color: 'var(--sidebar-heading)' }}>CORE OPERATIONS</h4>
        
        <Link to="/dashboard" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={dashboard} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Dashboard
          </div>
        </Link>
        
        <Link to="/users" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={incidents} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Incidents
          </div>
        </Link>
        
        <Link to="/safeguarding" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={safeguarding} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Safeguarding
          </div>
        </Link>
        
        <Link to="/attendance" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={attendance} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Attendance
          </div>
        </Link>
        
        <Link to="/sbt" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={studentBehavior} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Student Behavior Trends
          </div>
        </Link>
        <hr />
        {/* ********************************************* */}
        <h4 className="sidebar-text" style={{ color: 'var(--sidebar-heading)' }}>ACADEMIC & CLASS MANAGEMENT</h4>
        
        <Link to="/classes" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={classes} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Classes
          </div>
        </Link>

        <Link to="/classes" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={reports} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Reports
          </div>
        </Link>
        <hr />
        {/* ********************************************* */}
        <h4 className="sidebar-text" style={{ color: 'var(--sidebar-heading)' }}>USER & STAFF MANAGEMENT</h4>
        <Link to="/users" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={users} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Users
          </div>
        </Link>
        
        <Link to="/users" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={compliance} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Compliance
          </div>
        </Link>
        <hr />
        {/* ********************************************* */}
        <h4 className="sidebar-text" style={{ color: 'var(--sidebar-heading)' }}>CONFIGURATIONS</h4>
        <Link to="/users" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <img src={settings} alt="logo" style={{ width: 25, height: 25, filter: 'var(--icon-filter)' }} />
            Settings
          </div>
        </Link>
        <Link to="/roles" className="sidebar-text sidebar-link" style={{ color: 'var(--sidebar-text)' }}>
          <div className='link'>
            <FontAwesomeIcon className='icon' icon={faGear} />Roles
          </div>
        </Link>
        
        
      </nav>
    </aside>
  );
}
