// src/frontend/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';
import '../styles/common.css';
import { clearSessionData } from '../../services/authServices';
import { getCurrentUserProfile, updateUserProfile, uploadProfilePictureWithRefresh } from '../../services/userServices';
import { normalizeImageUrl, getFallbackImageSrc } from '../utils/imageHelper';

interface UserData {
  user_id: string;
  uname: string;
  email: string;
  profile_pic: string | null;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ uname: '', email: '' });
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleProfilePictureUpdate = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }    setUploading(true);
    try {      await uploadProfilePictureWithRefresh(selectedImage);
      alert('Profile picture updated successfully!');
      
      // Refresh user data
      const updatedUser = await getCurrentUserProfile();
      if (updatedUser) {
        // Use the normalizeImageUrl utility to handle profile picture URLs consistently
        if (updatedUser.profile_pic) {
          updatedUser.profile_pic = normalizeImageUrl(updatedUser.profile_pic, 'profiles');
        }
        setUserData(updatedUser);
      }
      
      // Clear selection
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEditToggle = () => {
    if (!editing && userData) {
      setEditForm({ uname: userData.uname, email: userData.email });
    }
    setEditing(!editing);
  };  const handleEditSubmit = async () => {
    if (!editForm.uname.trim() || !editForm.email.trim()) {
      alert('Please fill in all fields');
      return;
    }    try {
      await updateUserProfile(editForm);
      alert('Profile updated successfully!');
      
      // Refresh user data
      const updatedUser = await getCurrentUserProfile();
      if (updatedUser) {
        // Use the normalizeImageUrl utility to handle profile picture URLs consistently
        if (updatedUser.profile_pic) {
          updatedUser.profile_pic = normalizeImageUrl(updatedUser.profile_pic, 'profiles');
        }
        setUserData(updatedUser);
      }
      
      setEditing(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };    // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUserProfile();
        if (user) {
          // Use the normalizeImageUrl utility to handle profile picture URLs consistently
          if (user.profile_pic) {
            user.profile_pic = normalizeImageUrl(user.profile_pic, 'profiles');
          }
          setUserData(user);
        } else {
          // If no user data, redirect to login
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  if (loading) {
    return (
      <div className="profile-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading profile...</h3>
          <p>Please wait while we fetch your profile information.</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-detail-container">
        <div className="error-state">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
          </div>
          <h3>Failed to load profile</h3>
          <p>We encountered an error while loading your profile data.</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }  return (
    <div className="profile-detail-container">
      {/* Profile Header Section */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">            {userData.profile_pic ? (
              <img 
                src={userData.profile_pic} 
                alt="Profile Picture" 
                className="profile-avatar"
                onError={(e) => {
                  console.error(`Failed to load profile image: ${e.currentTarget.src}`);
                  // Use our standardized fallback image function
                  e.currentTarget.src = getFallbackImageSrc(120, 120, 36);
                }}
              />
            ) : (
              <div className="profile-avatar-placeholder">
                <span>{userData.uname.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h1>{userData.uname}</h1>
            <p className="profile-email">{userData.email}</p>
            
            <div className="profile-meta-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6 1a3 3 0 0 0-3 3v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a3 3 0 0 0-3-3H6zM5 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4z"/>
                <path d="M7 6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V6z"/>
              </svg>
              <span className="meta-label">Member since:</span>
              <span className="meta-date">
                {new Date(userData.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          <div className="profile-action-bar">
            <button onClick={handleEditToggle} className="edit-profile-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
              </svg>
              {editing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>      {/* Profile Content Sections */}
      <div className="profile-content">
        {/* Main Profile Information Section */}
        <div className="profile-main-section">
          <div className="profile-section info-section">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
              Profile Information
            </h2>
            
            {!editing ? (
              <div className="profile-info-display">
                <div className="info-item">
                  <div className="info-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    Username
                  </div>
                  <div className="info-value">{userData.uname}</div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 2A2 2 0 0 0 0 4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zM1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2-7-4.2V4zm13 2.383-4.758 2.855L15 11.114v-4.731zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-4.694 4.441A1 1 0 0 0 2 15h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.731z"/>
                    </svg>
                    Email
                  </div>
                  <div className="info-value">{userData.email}</div>
                </div>
              </div>
            ) : (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label className="form-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.uname}
                    onChange={(e) => setEditForm({...editForm, uname: e.target.value})}
                    className="form-input"
                    placeholder="Enter your username"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 2A2 2 0 0 0 0 4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zM1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2-7-4.2V4zm13 2.383-4.758 2.855L15 11.114v-4.731zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-4.694 4.441A1 1 0 0 0 2 15h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.731z"/>
                    </svg>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="form-actions">
                  <button onClick={handleEditSubmit} className="btn btn-success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                    Save Changes
                  </button>
                  <button onClick={handleEditToggle} className="btn btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Picture Management Section */}
        <div className="profile-sidebar-section">
          <div className="profile-section picture-section">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
              </svg>
              Profile Picture
            </h2>
            
            <div className="current-picture-display">
              <div className="current-picture-container">
                {userData.profile_pic ? (
                  <img 
                    src={userData.profile_pic} 
                    alt="Current Profile" 
                    className="current-profile-pic"
                  />
                ) : (
                  <div className="picture-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    <span>No Profile Picture</span>
                  </div>
                )}
              </div>
            </div>

            <div className="picture-upload-section">
              <div className="upload-preview-container">
                {imagePreview ? (
                  <div className="preview-container">
                    <img 
                      src={imagePreview}
                      alt="Profile Preview" 
                      className="profile-preview"
                    />
                    <div className="preview-label">Preview</div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.91 1.273V5a1 1 0 0 0-1-1h-10z"/>
                    </svg>
                    <span>Select New Image</span>
                  </div>
                )}
              </div>
              
              <div className="upload-controls">
                <label className="file-upload-btn">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="file-input" 
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  Choose New Image
                </label>
                
                <button 
                  onClick={handleProfilePictureUpdate} 
                  className="btn btn-primary"
                  disabled={!selectedImage || uploading}
                >
                  {uploading ? (
                    <>
                      <div className="btn-loading-spinner"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                      </svg>
                      Update Picture
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;