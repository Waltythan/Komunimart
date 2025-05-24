// src/frontend/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { clearSessionData } from '../../services/authServices';
import { getCurrentUsername } from '../../services/userServices';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Komunimart', subtitle }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState<string | null>(null);
    useEffect(() => {
    const currentUsername = getCurrentUsername();
    setUsername(currentUsername);
    console.log("Current username from token:", currentUsername);
  }, []);
  
  const handleLogout = () => {
    clearSessionData();
    window.location.href = '/';
  };

  // Get first letter of username for profile pic
  const getInitial = () => {
    if (username && username.length > 0) {
      return username.charAt(0).toUpperCase();
    }
    return '?';
  };
  
  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="app-title" onClick={() => navigate('/groups')}>
          {title}
        </h1>        <div className="search-container">
          <input 
            type="text" 
            className="search-input"
            placeholder="Search groups, users, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />          <button className="search-button" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="header-right">
        <div className="nav-actions">
          <div className="profile-menu">
            <div className="username-display">{username || 'User'}</div>
            <button 
              className="profile-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="profile-initial-circle">
                {getInitial()}
              </div>
            </button>
            {showDropdown && (
              <div className="profile-dropdown">
                <Link to="/profile" className="dropdown-item">
                  <div className="dropdown-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                  </div>
                  <span>My Profile</span>
                </Link>
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item">
                  <div className="dropdown-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
