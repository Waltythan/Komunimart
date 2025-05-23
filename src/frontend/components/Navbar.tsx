// src/frontend/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { clearSessionData } from '../../services/authServices';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Komunimart', subtitle }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    clearSessionData();
    window.location.href = '/';
  };

  // Hardcoded user id - replace with context/session data later
  const userId = "8f45c368-ec32-4766-bb15-a178aa924a16";
  
  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="app-title" onClick={() => navigate('/groups')}>{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      <div className="header-right">
        <nav className="main-nav">
          <Link to="/groups" className="nav-link">Groups</Link>
          <div className="profile-menu">
            <button className="profile-button">Profile</button>
            <div className="profile-dropdown">
              <Link to="/profile" className="dropdown-item">My Profile</Link>
              <button onClick={handleLogout} className="dropdown-item">Logout</button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
