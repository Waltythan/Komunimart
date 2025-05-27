import React, { useState, useEffect } from 'react';
import { getGroupMembers, removeMemberFromGroup, isGroupAdmin } from '../../services/membershipServices';
import { getCurrentUserId } from '../../services/userServices';
import { getSessionData } from '../../services/authServices';
import '../styles/MembersList.css';
import { normalizeImageUrl } from '../utils/imageHelper';

interface MembersListProps {
  groupId: string;
  currentUserRole?: string;
  onMemberUpdate?: () => void;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  user: {
    user_id: string;
    uname: string;
    email: string;
    profile_pic: string | null;
  };
}

const MembersList: React.FC<MembersListProps> = ({ groupId, currentUserRole, onMemberUpdate }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState<boolean>(false);
  const currentUserId = getCurrentUserId();
  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) {
        setIsLoading(false);
        return;
      }

      try {
        const membersData = await getGroupMembers(groupId);
        setMembers(membersData);
        setError(null);
        
        // Check if current user is admin
        if (currentUserId) {
          const adminStatus = await isGroupAdmin(groupId, currentUserId);
          setIsCurrentUserAdmin(adminStatus);
        }
      } catch (err) {
        console.error('Error fetching group members:', err);
        setError('Failed to load group members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [groupId]);
  const handleRemoveMember = async (userId: string) => {
    if (!currentUserId) {
      alert('Authentication required');
      return;
    }

    if (!confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }

    try {
      const success = await removeMemberFromGroup(groupId, userId);
      
      if (success) {
        alert('Member removed successfully');
        // Refresh members list
        const membersData = await getGroupMembers(groupId);
        setMembers(membersData);
        if (onMemberUpdate) onMemberUpdate();
      } else {
        alert('Failed to remove member');
      }
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Failed to remove member');
    }
  };  const getProfileImage = (member: Member) => {
    if (member.user.profile_pic) {
      // Use the normalizeImageUrl utility to handle all URL formats consistently
      return normalizeImageUrl(member.user.profile_pic, 'profiles');
    }
    
    // Default is the first letter of the username
    return (
      <div className="member-initial">
        {member.user.uname.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (isLoading) {
    return <div className="members-loading">Loading members...</div>;
  }

  if (error) {
    return <div className="members-error">{error}</div>;
  }

  return (
    <div className="members-list">
      <h3>Group Members ({members.length})</h3>
      {members.length === 0 ? (
        <p className="no-members">No members yet</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.id} className="member-item">
              <div className="member-left">
                <div className="member-avatar">                  {typeof getProfileImage(member) === 'string' ? (
                    <img 
                      src={getProfileImage(member) as string} 
                      alt={`${member.user.uname}`} 
                      className="member-profile-pic"
                      onError={(e) => {
                        console.error(`Failed to load member profile image: ${e.currentTarget.src}`);
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        // Try to find the parent and add a fallback
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'member-initial';
                          fallback.textContent = member.user.uname.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    getProfileImage(member)
                  )}
                </div>
                <div className="member-info">
                  <span className="member-name">{member.user.uname}</span>
                  {member.role === 'admin' && (
                    <span className="member-role">Admin</span>
                  )}
                </div>
              </div>
              {/* Admin actions */}
              {isCurrentUserAdmin && currentUserId !== member.user.user_id && (
                <div className="member-actions">
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveMember(member.user.user_id)}
                    title="Remove Member"
                  >
                    ❌
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MembersList;
