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

// Function to update a group (admin only)
export const updateGroup = async (groupId: string, formData: FormData): Promise<boolean> => {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update group');
    }

    return true;
  } catch (error) {
    console.error('Error updating group:', error);
    return false;
  }
};

// Function to delete a group (admin only)
export const deleteGroup = async (groupId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const userId = getCurrentUserId();
    
    const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deleted_by: userId })
    });    if (!response.ok) {
      let errorMessage = 'Failed to delete group';
        try {
        const errorData = await response.json();
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (jsonError) {
        // Could not parse JSON response
        console.error('Could not parse error response:', jsonError);
      }
      
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error; // Re-throw to handle in the component
  }
};
