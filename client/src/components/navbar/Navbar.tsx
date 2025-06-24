import React from 'react';
import './Navbar.scss'; // or .scss
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import bell from '../../assets/navbar/bell.svg';
import gear from '../../assets/navbar/gear.svg';
import sun from '../../assets/navbar/sun.svg';
import moon from '../../assets/navbar/moon.svg';

export default function Navbar() {
  // Theme state and effect at top level
  const [theme, setTheme] = React.useState(
    document.documentElement.getAttribute('data-theme') || 'light'
  );

  React.useEffect(() => {
    const handler = () => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

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
          <button className="navbar-icon"><img src={bell} alt="bell" className='nav-icon' style={{width:20,height:20,filter: 'var(--nav-icon-filter)'}} /></button>
          <button className="navbar-icon"><img src={gear} alt="gear" className='nav-icon' style={{width:20,height:20,filter: 'var(--nav-icon-filter)'}} /></button>
        {/* Theme mode toggle switch */}
        <label className="navbar-toggle-switch" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '10px' }}>
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={handleToggle}
            style={{ display: 'none' }}
          />
          <span
            style={{
              width: 47,
              height: 30,
              background: 'var(--hover-bg)',
              borderRadius: 12,
              position: 'relative',
              display: 'inline-block',
              transition: 'background 0.3s',
              boxShadow: '0 0 2px #888',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: theme === 'dark' ? 18 : 2,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--main-text)',
                transition: 'left 0.3s',
                boxShadow: '0 1px 2px #888',
              }}
            />
          </span>
          <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--main-text)' }}>
            {
              theme === 'dark' ? <img src={moon} alt="moon" className='nav-icon' style={{width:20,height:20,filter: 'var(--nav-icon-filter)'}} /> : 
              <img src={sun} alt="sun" className='nav-icon' style={{width:20,height:20,filter: 'var(--nav-icon-filter)'}} />
            }
          </span>
        </label>
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
