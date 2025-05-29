// src/services/bookmarkServices.ts
import apiFetch from './apiClient';
import { getCurrentUserId } from './userServices';

// Add a bookmark for a post
export const addBookmark = async (postId: string): Promise<boolean> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    
    await apiFetch('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: userId,
        post_id: postId
      })
    });
    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

// Remove a bookmark for a post
export const removeBookmark = async (postId: string): Promise<boolean> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    
    await apiFetch('/bookmarks', {
      method: 'DELETE',
      body: JSON.stringify({
        user_id: userId,
        post_id: postId
      })
    });
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

// Get user's bookmarks
export const getUserBookmarks = async (userId?: string): Promise<any[]> => {
  try {
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) throw new Error('User ID required');
    
    return await apiFetch(`/bookmarks/user/${targetUserId}`);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
};

// Check if a post is bookmarked by the current user
export const checkBookmarkStatus = async (postId: string): Promise<boolean> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) return false;
    
    const data = await apiFetch(`/bookmarks/status?user_id=${userId}&post_id=${postId}`);
    return data.isBookmarked;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};
