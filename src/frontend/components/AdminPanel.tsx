import React, { useState } from 'react';
import { getCurrentUserId } from '../../services/userServices';
import { deleteGroup } from '../../services/postServices';
import '../styles/AdminPanel.css';

interface AdminPanelProps {
  groupId: string;
  onMemberUpdate?: () => void;
  onGroupDeleted?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ groupId, onMemberUpdate, onGroupDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const handleDeleteGroup = async () => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      alert('Authentication required');
      return;
    }
    
    try {
      const success = await deleteGroup(groupId);
      
      if (success) {
        alert('Group deleted successfully');
        if (onGroupDeleted) {
          onGroupDeleted();
        }
      } else {
        alert('Failed to delete group');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Failed to delete group');
    }
    
    setShowDeleteConfirm(false);
  };

  return (
    <div className="admin-panel">
      <button 
        className="admin-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        ⚙️ Admin Panel
      </button>
      
      {isOpen && (
        <div className="admin-panel-content">
          <h3>Admin Actions</h3>
          
          <div className="admin-actions">
            <button 
              className="admin-action-btn danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Group
            </button>
          </div>
          
          {showDeleteConfirm && (
            <div className="delete-confirm-modal">
              <div className="delete-confirm-content">
                <h4>Confirm Delete Group</h4>
                <p>Are you sure you want to delete this group? This action cannot be undone and will delete all posts, comments, and memberships in this group.</p>
                <div className="delete-confirm-actions">
                  <button 
                    className="confirm-btn danger"
                    onClick={handleDeleteGroup}
                  >
                    Yes, Delete Group
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
