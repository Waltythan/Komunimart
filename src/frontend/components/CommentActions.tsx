import React, { useState, useEffect } from 'react';
import { getCurrentUserId } from '../../services/userServices';
import { deleteComment } from '../../services/postServices';
import { isGroupAdmin } from '../../services/membershipServices';
import '../styles/CommentActions.css';

interface CommentActionsProps {
  commentId: string;
  authorId: string;
  groupId: string;
  onCommentDeleted?: () => void;
}

const CommentActions: React.FC<CommentActionsProps> = ({ 
  commentId, 
  authorId, 
  groupId,
  onCommentDeleted 
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
  const handleDeleteComment = async () => {
    if (!currentUserId) {
      alert('Authentication required');
      return;
    }

    try {
      const success = await deleteComment(commentId);
      
      if (success) {
        alert('Comment deleted successfully');
        if (onCommentDeleted) {
          onCommentDeleted();
        }
      } else {
        alert('Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }

    setShowConfirm(false);
  };  return (
    <div className="comment-delete-container">
      <button 
        className="delete-comment-btn"
        onClick={() => setShowConfirm(true)}
        title="Delete Comment"
        aria-label="Delete Comment"
      >
        🗑️
      </button>
      {showConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h4>Delete Comment</h4>
            <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button 
                className="confirm-btn danger"
                onClick={handleDeleteComment}
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

export default CommentActions;
