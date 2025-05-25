import { getSessionData } from './authServices';
import { getCurrentUserId } from './userServices';

// Function to delete a post (admin or author only)
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/posts/admin/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deleted_by: getCurrentUserId() })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete post');
    }

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

// Function to delete a comment (admin or author only)
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/posts/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete comment');
    }

    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

// Function to delete a group (admin only)
export const deleteGroup = async (groupId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete group');
    }

    return true;
  } catch (error) {
    console.error('Error deleting group:', error);
    return false;
  }
};
