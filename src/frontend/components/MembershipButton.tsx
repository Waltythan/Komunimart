import React, { useState, useEffect } from 'react';
import { joinGroup, leaveGroup, checkGroupMembership, isGroupCreator, isGroupAdmin } from '../../services/membershipServices';
import { getCurrentUserId } from '../../services/userServices';
import '../styles/MembershipButton.css';

interface MembershipButtonProps {
  groupId: string;
  onMembershipChange?: (isMember: boolean) => void;
  onAdminStatusChange?: (isAdmin: boolean) => void;
}

const MembershipButton: React.FC<MembershipButtonProps> = ({ groupId, onMembershipChange, onAdminStatusChange }) => {
  const [isMember, setIsMember] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const fetchCurrentUser = () => {
      const currentUserId = getCurrentUserId();
      setUserId(currentUserId);
      return currentUserId;
    };    const checkMembership = async (uid: string | null) => {
      if (!uid || !groupId) {
        setIsLoading(false);
        return;
      }

      try {        // Check if user is the creator
        const creatorStatus = await isGroupCreator(groupId, uid);
        setIsCreator(creatorStatus);
        
        // Check if user is admin (creator or promoted admin)
        const adminStatus = await isGroupAdmin(groupId, uid);
        setIsAdmin(adminStatus);
        if (onAdminStatusChange) {
          onAdminStatusChange(adminStatus);
        }
        
        // If user is creator, they're automatically a member
        if (creatorStatus) {
          setIsMember(true);
          if (onMembershipChange) {
            onMembershipChange(true);
          }
          setIsLoading(false);
          return;
        }
        
        // Otherwise check regular membership
        const membershipStatus = await checkGroupMembership(groupId, uid);
        setIsMember(membershipStatus);
        if (onMembershipChange) {
          onMembershipChange(membershipStatus);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      } finally {
        setIsLoading(false);
      }
    };    const uid = fetchCurrentUser();
    checkMembership(uid);
  }, [groupId, onMembershipChange, onAdminStatusChange]);
  const handleMembershipToggle = async () => {
    if (!userId || !groupId || isLoading) return;

    // If user is the creator, they can't leave
    if (isCreator) {
      return;
    }

    setIsLoading(true);
    try {
      let success: boolean;

      if (isMember) {
        success = await leaveGroup(groupId, userId);
        if (success) {
          setIsMember(false);
          if (onMembershipChange) {
            onMembershipChange(false);
          }
        }
      } else {
        success = await joinGroup(groupId, userId);
        if (success) {
          setIsMember(true);
          if (onMembershipChange) {
            onMembershipChange(true);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling membership:', error);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return <button className="membership-button loading">Loading...</button>;
  }
  // If user is the creator, show a different button
  if (isCreator) {
    return (
      <button
        className="membership-button creator"
        disabled={true}
      >
        Group Creator
      </button>
    );
  }

  // If user is admin but not creator, show admin status
  if (isAdmin) {
    return (
      <button
        className="membership-button admin"
        disabled={true}
      >
        Group Admin
      </button>
    );
  }

  return (
    <button
      className={`membership-button ${isMember ? 'leave' : 'join'}`}
      onClick={handleMembershipToggle}
      disabled={isLoading}
    >
      {isMember ? 'Leave Group' : 'Join Group'}
    </button>
  );
};

export default MembershipButton;
