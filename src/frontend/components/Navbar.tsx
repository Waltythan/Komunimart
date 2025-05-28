// src/frontend/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { clearSessionData } from '../../services/authServices';
import { getCurrentUsername, getCurrentUserProfile, onProfileUpdate, storeCurrentUsername } from '../../services/userServices';
import { getSearchSuggestions, SearchSuggestion } from '../../services/searchServices';
import { normalizeImageUrl } from '../utils/imageHelper';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Komunimart', subtitle }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUsername = getCurrentUsername();
        setUsername(currentUsername);
        // Fetch full user profile to get profile picture
        const userProfile = await getCurrentUserProfile();
        if (userProfile) {
          // Store username in session storage to ensure it's up to date
          if (userProfile.uname) {
            storeCurrentUsername(userProfile.uname);
            setUsername(userProfile.uname);
          }
          
          // Handle profile picture if available
          if (userProfile.profile_pic) {
            // Use the normalizeImageUrl utility for consistent URL handling
            const profilePicUrl = normalizeImageUrl(userProfile.profile_pic, 'profiles');
            setProfilePicture(profilePicUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile in navbar:', error);
        // Fallback to just username if profile fetch fails
        const currentUsername = getCurrentUsername();
        setUsername(currentUsername);
      }
    };
    
    fetchUserData();
    
    // Listen for profile updates
    const unsubscribe = onProfileUpdate(() => {
      fetchUserData();
    });
    
    // Cleanup listener on unmount
    return unsubscribe;
  }, []);
    const handleLogout = () => {
    clearSessionData();
    window.location.href = '/';
  };

  // Handle search functionality
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length >= 2) {
      try {
        const searchSuggestions = await getSearchSuggestions(value.trim(), 5);
        setSuggestions(searchSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        // Don't show suggestions if there's an error (like authentication issues)
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(suggestion.title)}`);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
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
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input 
              type="text" 
              className="search-input"
              placeholder="Search Komunimart"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <button type="submit" className="search-button" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </button>
          </form>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((suggestion) => (
                <div
                  key={`${suggestion.type}-${suggestion.id}`}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-icon">
                    {suggestion.type === 'group' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                        <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                      </svg>
                    )}
                  </div>
                  <div className="suggestion-content">
                    <span className="suggestion-title">{suggestion.title}</span>
                    {suggestion.groupName && (
                      <span className="suggestion-group">in {suggestion.groupName}</span>
                    )}
                  </div>
                  <span className="suggestion-type">{suggestion.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="header-right">
        <div className="nav-actions">
          <div className="profile-menu">
            <div className="username-display">{username || 'User'}</div>            <button 
              className="profile-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt={`${username}'s profile`}
                  className="profile-picture-nav"
                />
              ) : (
                <div className="profile-initial-circle">
                  {getInitial()}
                </div>
              )}
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
