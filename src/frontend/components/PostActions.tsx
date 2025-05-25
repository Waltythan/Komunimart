import React, { useState, useEffect } from 'react';
import { getCurrentUserId } from '../../services/userServices';
import { deletePost } from '../../services/postServices';
import { isGroupAdmin } from '../../services/membershipServices';
import '../styles/PostActions.css';

interface PostActionsProps {
  postId: string;
  authorId: string;
  groupId: string;
  onPostDeleted?: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({ 
  postId, 
  authorId, 
  groupId, 
  onPostDeleted 
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const currentUserId = getCurrentUserId();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUserId && groupId) {
        const adminStatus = await isGroupAdmin(groupId, currentUserId);
        setIsAdmin(adminStatus);
      }
    };
    
    checkAdminStatus();
  }, [currentUserId, groupId]);
  
  // Show delete button if user is the author or an admin
  const canDelete = currentUserId === authorId || isAdmin;
  
  if (!canDelete) {
    return null;
  }
  const handleDeletePost = async () => {
    if (!currentUserId) {
      alert('Authentication required');
      return;
    }

    try {
      const success = await deletePost(postId);
      
      if (success) {
        alert('Post deleted successfully');
        if (onPostDeleted) {
          onPostDeleted();
        }
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }

    setShowConfirm(false);
  };

  return (
    <div className="post-actions">
      <button 
        className="delete-post-btn"
        onClick={() => setShowConfirm(true)}
        title="Delete Post"
      >
        🗑️
      </button>
      
      {showConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h4>Delete Post</h4>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button 
                className="confirm-btn danger"
                onClick={handleDeletePost}
              >
                Delete
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostActions;
