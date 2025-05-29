import apiFetch from './apiClient';
import { getCurrentUserId } from './userServices';
import { Group, GroupMember } from './membershipServices';

/**
 * Create a new group
 * @param formData - Form data containing group details
 * @returns Promise resolving to created group
 */
export async function createGroup(formData: FormData): Promise<Group> {
  return apiFetch<Group>('/groups', { method: 'POST', body: formData });
}

/**
 * Get group by ID
 * @param groupId - ID of the group
 * @returns Promise resolving to group data
 */
export async function getGroupById(groupId: string): Promise<Group> {
  return apiFetch<Group>(`/groups/${groupId}`);
}

/**
 * Get all public groups
 * @returns Promise resolving to array of groups
 */
export async function getAllGroups(): Promise<Group[]> {
  return apiFetch<Group[]>('/groups');
}

/**
 * Update a group (admin only)
 * @param groupId - ID of the group to update
 * @param formData - Form data containing updated group details
 * @returns Promise resolving to boolean indicating success
 */
export const updateGroup = async (groupId: string, formData: FormData): Promise<boolean> => {
  try {
    await apiFetch(`/groups/${groupId}`, { method: 'PUT', body: formData });
    return true;
  } catch (error) {
    console.error('Error updating group:', error);
    return false;
  }
};

/**
 * Delete a group (admin only)
 * @param groupId - ID of the group to delete
 * @returns Promise resolving to boolean indicating success
 */
export const deleteGroup = async (groupId: string): Promise<boolean> => {
  try {
    await apiFetch(`/groups/${groupId}`, {
      method: 'DELETE',
      body: JSON.stringify({ deleted_by: getCurrentUserId() })
    });
    return true;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error; // Re-throw to handle in the component
  }
};

/**
 * Get posts for a specific group
 * @param groupId - ID of the group
 * @returns Promise resolving to array of posts
 */
export async function getGroupPosts(groupId: string): Promise<any[]> {
  return apiFetch<any[]>(`/protected-posts/group/${groupId}`);
}
