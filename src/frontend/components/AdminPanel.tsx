import React, { useState } from 'react';
import { getCurrentUserId } from '../../services/userServices';
import { deleteGroup } from '../../services/postServices';
import EditGroupForm from './EditGroupForm';
import '../styles/AdminPanel.css';

interface AdminPanelProps {
  groupId: string;
  groupName?: string;
  groupDescription?: string;
  groupImageUrl?: string;
  onMemberUpdate?: () => void;
  onGroupDeleted?: () => void;
  onGroupUpdated?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  groupId, 
  groupName = '', 
  groupDescription = '', 
  groupImageUrl,
  onMemberUpdate, 
  onGroupDeleted,
  onGroupUpdated 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);  const handleDeleteGroup = async () => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      alert('Authentication required');
      return;
    }
    
    try {
      setShowDeleteConfirm(false); // Close the dialog first to show processing
      
      console.log(`Attempting to delete group ${groupId} by user ${userId}`);
      
      try {
        await deleteGroup(groupId);
        alert('Group deleted successfully');
        if (onGroupDeleted) {
          onGroupDeleted();
        }
      } catch (error: any) {
        // Handle specific error that came back from the service
        console.error('Service error deleting group:', error);
        let errorMsg = 'Failed to delete group';
        
        if (error?.message) {
          errorMsg = error.message;
        }
        
        alert(`Error: ${errorMsg}`);
      }
    } catch (err) {
      // Handle unexpected errors
      console.error('Unexpected error in delete handler:', err);
      alert(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setIsOpen(false);
    if (onGroupUpdated) {
      onGroupUpdated();
    }
  };
  return (
    <div className="admin-panel">
      <button 
        className="admin-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
        </svg>
        Settings
      </button>
      
      {isOpen && (
        <div className="admin-panel-content">
          <h3>Admin Actions</h3>          <div className="admin-actions">
            <button 
              className="admin-action-btn edit"
              onClick={() => setShowEditForm(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
              </svg>
              Edit Group
            </button>
            
            <button 
              className="admin-action-btn danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
              Delete Group
            </button>
          </div>
          
          {showDeleteConfirm && (
            <div className="delete-confirm-modal">
              <div className="delete-confirm-content">
                <h4>Confirm Delete Group</h4>
                <p>Are you sure you want to delete this group? This action cannot be undone and will delete all posts, comments, and memberships in this group.</p>
                <div className="delete-confirm-actions">                  <button 
                    className="confirm-btn danger"
                    onClick={handleDeleteGroup}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                    </svg>
                    Yes, Delete Group
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>            </div>
          )}
        </div>
      )}
      
      {showEditForm && (
        <EditGroupForm
          groupId={groupId}
          currentName={groupName}
          currentDescription={groupDescription}
          currentImageUrl={groupImageUrl}
          onSuccess={handleEditSuccess}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
