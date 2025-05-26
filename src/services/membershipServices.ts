import { getSessionData } from './authServices';
import { getCurrentUserId } from './userServices';

// Function to join a group
export const joinGroup = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const response = await fetch('http://localhost:3000/memberships/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        group_id: groupId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to join group');
    }

    return true;
  } catch (error) {
    console.error('Error joining group:', error);
    return false;
  }
};

// Function to leave a group
export const leaveGroup = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const response = await fetch('http://localhost:3000/memberships/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        group_id: groupId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to leave group');
    }

    return true;
  } catch (error) {
    console.error('Error leaving group:', error);
    return false;
  }
};

// Function to check if a user is a member of a group
export const checkGroupMembership = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/memberships/check/${groupId}/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isMember;
  } catch (error) {
    console.error('Error checking group membership:', error);
    return false;
  }
};

// Function to get all members of a group
export const getGroupMembers = async (groupId: string): Promise<any[]> => {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/memberships/group/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get group members');
    }

    const members = await response.json();
    return members;
  } catch (error) {
    console.error('Error getting group members:', error);
    return [];
  }
};

// Function to get all groups a user is a member of
export const getUserGroups = async (userId: string): Promise<any[]> => {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/memberships/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user groups');
    }

    const groups = await response.json();
    return groups;
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
};

// Function to check if user is the creator of a group
export const isGroupCreator = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return false;
    }

    const groupData = await response.json();
    return groupData.created_by === userId;
  } catch (error) {
    console.error('Error checking if user is group creator:', error);
    return false;
  }
};

// Function to check if user is an admin of a group (creator or promoted admin)
export const isGroupAdmin = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    
    // First check if user is creator
    const creatorResponse = await fetch(`http://localhost:3000/groups/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (creatorResponse.ok) {
      const groupData = await creatorResponse.json();
      if (groupData.created_by === userId) {
        return true;
      }
    }

    // Then check if user has admin role in membership
    const membershipResponse = await fetch(`http://localhost:3000/memberships/check/${groupId}/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!membershipResponse.ok) {
      return false;
    }    const membershipData = await membershipResponse.json();
    return membershipData.isMember && membershipData.role === 'admin';
  } catch (error) {
    console.error('Error checking if user is group admin:', error);
    return false;
  }
};

// Function to get member count of a group
export const getGroupMemberCount = async (groupId: string): Promise<number> => {
  try {
    // Use the existing getGroupMembers function and count the results
    const members = await getGroupMembers(groupId);
    return members.length;
  } catch (error) {
    console.error('Error getting group member count:', error);
    return 0;
  }
};

// Function to remove a member from group
export const removeMemberFromGroup = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const token = getSessionData();
    const currentUserId = getCurrentUserId();
    
    if (!currentUserId) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`http://localhost:3000/memberships/remove/${groupId}/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        removed_by: currentUserId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove member');
    }

    return true;
  } catch (error) {
    console.error('Error removing member:', error);
    return false;
  }
};
