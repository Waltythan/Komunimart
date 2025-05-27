import { getSessionData } from './authServices';
import { getCurrentUserId } from './userServices';

// Add a bookmark for a post
export const addBookmark = async (postId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const userId = getCurrentUserId();
      if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch('http://localhost:3000/api/bookmarks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        post_id: postId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add bookmark');
    }

    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

// Remove a bookmark for a post
export const removeBookmark = async (postId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const userId = getCurrentUserId();
      if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch('http://localhost:3000/api/bookmarks', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        post_id: postId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove bookmark');
    }

    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

// Get user's bookmarks
export const getUserBookmarks = async (userId?: string): Promise<any[]> => {
  try {
    const token = getSessionData();
    const targetUserId = userId || getCurrentUserId();
      if (!targetUserId) {
      throw new Error('User ID required');
    }
    
    const response = await fetch(`http://localhost:3000/api/bookmarks/user/${targetUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch bookmarks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
};

// Check if a post is bookmarked by the current user
export const checkBookmarkStatus = async (postId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const userId = getCurrentUserId();
      if (!userId) {
      return false;
    }
    
    const response = await fetch(`http://localhost:3000/api/bookmarks/status?user_id=${userId}&post_id=${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isBookmarked;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};
