import apiFetch from './apiClient';
import { getCurrentUserId } from './userServices';

/**
 * Interface for group member data
 */
export interface GroupMember {
  id: string;
  username: string;
  email?: string;
  profile_image?: string;
  role: 'member' | 'admin';
  joined_at: string;
}

/**
 * Interface for group data
 */
export interface Group {
  id?: string;
  group_id?: string;
  name: string;
  description: string;
  created_by: string;
  image_url?: string;
  created_at: string;
  member_count?: number;
}

/**
 * Function to join a group
 * @param groupId - ID of the group to join
 * @param userId - ID of the user joining the group
 * @returns Promise resolving to boolean indicating success
 */
export const joinGroup = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    // Validate parameters
    if (!groupId || groupId === 'undefined' || !userId || userId === 'undefined') {
      console.warn('joinGroup called with invalid parameters:', { groupId, userId });
      return false;
    }
    
    await apiFetch('/memberships/join', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        group_id: groupId
      })
    });

    return true;
  } catch (error) {
    console.error('Error joining group:', error);
    return false;
  }
};

/**
 * Function to leave a group
 * @param groupId - ID of the group to leave
 * @param userId - ID of the user leaving the group
 * @returns Promise resolving to boolean indicating success
 */
export const leaveGroup = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    // Validate parameters
    if (!groupId || groupId === 'undefined' || !userId || userId === 'undefined') {
      console.warn('leaveGroup called with invalid parameters:', { groupId, userId });
      return false;
    }
    
    await apiFetch('/memberships/leave', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        group_id: groupId
      })
    });

    return true;
  } catch (error) {
    console.error('Error leaving group:', error);
    return false;
  }
};

/**
 * Function to check if a user is a member of a group
 * @param groupId - ID of the group
 * @param userId - ID of the user
 * @returns Promise resolving to boolean indicating if user is a member
 */
export const checkGroupMembership = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    // Validate parameters
    if (!groupId || groupId === 'undefined' || !userId || userId === 'undefined') {
      console.warn('checkGroupMembership called with invalid parameters:', { groupId, userId });
      return false;
    }
    
    const data = await apiFetch<{isMember: boolean, role?: string}>(`/memberships/check/${groupId}/${userId}`);
    return data.isMember;
  } catch (error) {
    console.error('Error checking group membership:', error);
    return false;
  }
};

/**
 * Function to get all members of a group
 * @param groupId - ID of the group
 * @returns Promise resolving to array of group members
 */
export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  try {
    // Validate parameter
    if (!groupId || groupId === 'undefined') {
      console.warn('getGroupMembers called with invalid groupId:', groupId);
      return [];
    }
    
    return await apiFetch<GroupMember[]>(`/memberships/group/${groupId}`);
  } catch (error) {
    console.error('Error getting group members:', error);
    return [];
  }
};

/**
 * Function to get all groups a user is a member of
 * @param userId - ID of the user
 * @returns Promise resolving to array of groups
 */
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    // Validate parameter
    if (!userId || userId === 'undefined') {
      console.warn('getUserGroups called with invalid userId:', userId);
      return [];
    }
    
    return await apiFetch<Group[]>(`/memberships/user/${userId}`);
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
};

/**
 * Function to check if user is the creator of a group
 * @param groupId - ID of the group
 * @param userId - ID of the user
 * @returns Promise resolving to boolean indicating if user is the creator
 */
export const isGroupCreator = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    // Validate parameters
    if (!groupId || groupId === 'undefined' || !userId || userId === 'undefined') {
      console.warn('isGroupCreator called with invalid parameters:', { groupId, userId });
      return false;
    }
    
    const groupData = await apiFetch<Group>(`/groups/${groupId}`);
    return groupData.created_by === userId;
  } catch (error) {
    console.error('Error checking if user is group creator:', error);
    return false;
  }
};

/**
 * Function to check if user is an admin of a group (creator or promoted admin)
 * @param groupId - ID of the group
 * @param userId - ID of the user
 * @returns Promise resolving to boolean indicating if user is an admin
 */
export const isGroupAdmin = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    // Validate parameters
    if (!groupId || groupId === 'undefined' || !userId || userId === 'undefined') {
      console.warn('isGroupAdmin called with invalid parameters:', { groupId, userId });
      return false;
    }
    
    // First check if user is creator
    try {
      const groupData = await apiFetch<Group>(`/groups/${groupId}`);
      if (groupData.created_by === userId) {
        return true;
      }
    } catch {
      // Continue to check membership if not creator
    }
    
    // Then check if user has admin role in membership
    try {
      const membershipData = await apiFetch<{isMember: boolean, role?: string}>(`/memberships/check/${groupId}/${userId}`);
      return membershipData.isMember && membershipData.role === 'admin';
    } catch {
      return false;
    }
  } catch (error) {
    console.error('Error checking if user is group admin:', error);
    return false;
  }
};

/**
 * Function to get member count of a group
 * @param groupId - ID of the group
 * @returns Promise resolving to number of members in the group
 */
export const getGroupMemberCount = async (groupId?: string): Promise<number> => {
  try {
    // Check if groupId is valid
    if (!groupId) {
      console.warn('getGroupMemberCount called with undefined or empty groupId');
      return 0;
    }
    
    try {
      // Use the optimized count endpoint if available
      const data = await apiFetch<{count: number}>(`/memberships/group/${groupId}/count`);
      return data.count;
    } catch {
      // Fallback to the old method if count endpoint fails
      const members = await getGroupMembers(groupId);
      return members.length;
    }
  } catch (error) {
    console.error('Error getting group member count:', error);
    return 0;
  }
};

/**
 * Function to remove a member from a group
 * @param groupId - ID of the group
 * @param userId - ID of the user to remove
 * @returns Promise resolving to boolean indicating success
 */
export const removeMemberFromGroup = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    // Validate parameters
    if (!groupId || groupId === 'undefined' || !userId || userId === 'undefined') {
      console.warn('removeMemberFromGroup called with invalid parameters:', { groupId, userId });
      return false;
    }
    
    const currentUserId = getCurrentUserId();
    
    if (!currentUserId) {
      throw new Error('Authentication required');
    }
    
    await apiFetch(`/memberships/remove/${groupId}/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({
        removed_by: currentUserId
      })
    });

    return true;
  } catch (error) {
    console.error('Error removing member:', error);
    return false;
  }
};
