// src/frontend/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { clearSessionData, getSessionData } from '../../services/authServices';
import { getCurrentUsername, getCurrentUserProfile, onProfileUpdate, storeCurrentUsername } from '../../services/userServices';
import { searchContent, SearchResult, SearchResponse } from '../../services/searchServices';
import { normalizeImageUrl } from '../utils/imageHelper';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Komunimart', subtitle }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

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

    // Cleanup listener and search timeout on unmount
    return () => {
      unsubscribe();
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleLogout = () => {
    clearSessionData();
    window.location.href = '/';
  };

  // Handle search functionality
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.trim().length >= 2) {
      setShowSearchOverlay(true);

      // Set new timeout for debounced search
      const timeout = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchContent(value.trim(), 'all', 10);
          setSearchResults(results);
        } catch (error) {
          console.error('Error fetching search results:', error);

          // Handle authentication errors
          if (error instanceof Error && error.message.includes('Authentication')) {
            console.warn('User not authenticated, search disabled');
            setSearchResults({ posts: [], groups: [], total: 0 });
          } else {
            setSearchResults(null);
          }
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
      setSearchTimeout(timeout);
    } else {
      setSearchResults(null);
      setShowSearchOverlay(false);
    }
  };
  const handleResultClick = (result: SearchResult) => {
    setShowSearchOverlay(false);
    setSearchQuery('');
    setSelectedResultIndex(-1);
    if (result.type === 'group') {
      navigate(`/groups/${result.id}`);
    } else {
      navigate(`/post/${result.id}`);
    }
  }; const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2 && searchResults) {
      setShowSearchOverlay(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding overlay to allow clicking on results
    setTimeout(() => {
      setShowSearchOverlay(false);
      setSelectedResultIndex(-1);
    }, 200);
  };

  // Add keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchOverlay || !searchResults) return;

    const allResults = [
      ...searchResults.groups.slice(0, 5),
      ...searchResults.posts.slice(0, 5)
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev =>
          prev < allResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev =>
          prev > 0 ? prev - 1 : allResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedResultIndex >= 0 && allResults[selectedResultIndex]) {
          handleResultClick(allResults[selectedResultIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        clearSearch();
        break;
    }
  };

  // Reset selected index when search results change
  React.useEffect(() => {
    setSelectedResultIndex(-1);
  }, [searchResults]);

  // Scroll selected item into view
  React.useEffect(() => {
    if (selectedResultIndex >= 0) {
      const selectedElement = document.querySelector('.search-result-item.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedResultIndex]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchOverlay(false);
    setSelectedResultIndex(-1);
  };
  const handleSearchClick = () => {
    // Optional: Add any click-specific logic here
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
          <div className="search-input-wrapper">            <input
            type="text"
            className="search-input"
            placeholder="Search Komunimart"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onClick={handleSearchClick}
            onKeyDown={handleKeyDown}
          />            {searchQuery && (
            <button
              className="search-clear-button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
          </div>

          {/* Search Results Overlay */}
          {showSearchOverlay && (
            <div className="search-overlay">
              <div className="search-overlay-content">
                {isSearching ? (
                  <div className="search-loading">
                    <div className="loading-spinner"></div>
                    <span>Searching...</span>
                  </div>
                ) : searchResults && (searchResults.posts.length > 0 || searchResults.groups.length > 0) ? (
                  <>                    {/* Groups Section */}
                    {searchResults.groups.length > 0 && (
                      <div className="search-section">
                        <h3 className="search-section-title">Groups</h3>                        {searchResults.groups.slice(0, 3).map((group, index) => (
                          <div
                            key={`group-${group.id}`}
                            className={`search-result-item ${selectedResultIndex === index ? 'selected' : ''}`}
                            onClick={() => handleResultClick(group)}
                          >
                            <div className="result-content">
                              <div className="result-title">{group.title}</div>
                              {group.description && (
                                <div className="result-description">{group.description}</div>
                              )}
                              <div className="result-meta">
                                {group.memberCount || 0} members
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}                    {/* Posts Section */}
                    {searchResults.posts.length > 0 && (
                      <div className="search-section">
                        <h3 className="search-section-title">Posts</h3>                        {searchResults.posts.slice(0, 5).map((post, index) => {
                          const postIndex = searchResults.groups.slice(0, 3).length + index;
                          return (
                            <div
                              key={`post-${post.id}`}
                              className={`search-result-item ${selectedResultIndex === postIndex ? 'selected' : ''}`}
                              onClick={() => handleResultClick(post)}
                            >
                              <div className="result-content">
                                <div className="result-title">{post.title}</div>
                                {post.content && (
                                  <div className="result-description">
                                    {post.content.length > 100
                                      ? `${post.content.substring(0, 100)}...`
                                      : post.content
                                    }
                                  </div>
                                )}
                                <div className="result-meta">
                                  in {post.groupName}
                                  {post.author && ` • by ${post.author}`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="search-no-results">
                    <span>No results found for "{searchQuery}"</span>
                  </div>
                ) : null}
              </div>
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
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                    </svg>
                  </div>
                  <span>My Profile</span>
                </Link>
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item">
                  <div className="dropdown-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
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
