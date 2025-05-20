// src/pages/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';
import '../styles/common.css';

const ProfilePage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('image', selectedImage);
    // Hardcoded user_id for now, later use from auth context
    formData.append('user_id', '8f45c368-ec32-4766-bb15-a178aa924a16');

    try {
      const res = await fetch('http://localhost:3000/profile/image', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - FormData sets it automatically with boundary
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update profile picture');
      }

      const data = await res.json();
      alert('Profile picture updated successfully!');
      navigate('/profile'); // Refresh or redirect
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <div className="profile-picture-section">
        <div className="profile-picture-container">
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Profile Preview" 
              className="profile-preview"
            />
          )}
          {!imagePreview && (
            <div className="profile-placeholder">No Image Selected</div>
          )}
        </div>
        <label className="file-input-label">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="file-input" 
          />
          Choose Image
        </label>
      </div>
      <div className="action-buttons">
        <button 
          onClick={handleSubmit} 
          className="update-button"
          disabled={!selectedImage}
        >
          Update Profile Picture
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;