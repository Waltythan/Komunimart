// src/services/userServices.ts
import { jwtDecode } from "jwt-decode";
import { getSessionData } from "./authServices";

// Initialize the stored username when this module is first loaded
(function initializeStoredUsername() {
  const token = getSessionData();
  if (token) {
    try {
      const decoded = jwtDecode<{ userId: string; username: string }>(token);
      if (decoded.username) {
        sessionStorage.setItem('current_username', decoded.username);
      }
    } catch (error) {
      console.error('Error initializing stored username:', error);
    }
  }
})();

export interface DecodedToken {
  userId: string;
  username: string;
  // add more fields if needed
}

export function getCurrentUserId(): string | null {
  const token = getSessionData();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.userId;
  } catch {
    return null;
  }
}

// Store username in session storage for easy access without token decoding
export function storeCurrentUsername(username: string): void {
  sessionStorage.setItem('current_username', username);
}

export function getCurrentUsername(): string | null {
  // First try to get from session storage (most up-to-date)
  const storedUsername = sessionStorage.getItem('current_username');
  if (storedUsername) return storedUsername;
  
  // Fall back to token if no stored username
  const token = getSessionData();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // Store for future use
    storeCurrentUsername(decoded.username);
    return decoded.username;
  } catch {
    return null;
  }
}

// Function to get user details by ID
export async function getUserById(userId: string): Promise<any> {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

// Function to get current authenticated user data
export async function getCurrentUser(): Promise<any> {
  try {
    const token = getSessionData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:3000/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch current user data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

// Function to get current user profile
export async function getCurrentUserProfile(): Promise<any> {
  try {
    const token = getSessionData();
    if (!token) {
      // Log to browser console
      console.error('[getCurrentUserProfile] No authentication token found');
      // Also log to VSCode terminal by sending to a local debug endpoint (if backend supports it)
      try {
        await fetch('http://localhost:3000/debug/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: '[getCurrentUserProfile] No authentication token found',
            source: 'frontend',
            time: new Date().toISOString()
          })
        });
      } catch (e) {
        // Ignore if debug endpoint is not available
      }
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:3000/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
}

// Function to update user profile
export async function updateUserProfile(profileData: { uname?: string; email?: string }): Promise<any> {
  try {
    const token = getSessionData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:3000/profile/update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    const result = await response.json();
    
    // If username was updated, store it in session storage
    if (profileData.uname) {
      storeCurrentUsername(profileData.uname);
    }
    
    // Notify all listeners that profile was updated
    notifyProfileUpdate();
    
    return result;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Function to upload profile picture
export async function uploadProfilePicture(imageFile: File): Promise<any> {
  try {
    const token = getSessionData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('http://localhost:3000/profile/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload profile picture');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

// Function to delete user
export async function deleteUser(userId: string): Promise<any> {
  try {
    const token = getSessionData();
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Event system for profile updates
const profileUpdateListeners: (() => void)[] = [];

export function onProfileUpdate(callback: () => void): () => void {
  profileUpdateListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = profileUpdateListeners.indexOf(callback);
    if (index > -1) {
      profileUpdateListeners.splice(index, 1);
    }
  };
}

export function notifyProfileUpdate(): void {
  profileUpdateListeners.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in profile update listener:', error);
    }
  });
}

// Enhanced upload function that notifies listeners
export async function uploadProfilePictureWithRefresh(imageFile: File): Promise<any> {
  try {
    const result = await uploadProfilePicture(imageFile);
    
    // Notify all listeners that profile was updated
    notifyProfileUpdate();
    
    return result;
  } catch (error) {
    throw error;
  }
}
