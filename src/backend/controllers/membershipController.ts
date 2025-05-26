import { Request, Response } from 'express';
const db = require('../../../models');
import { Op } from 'sequelize';

// Add a user to a group
export const joinGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { group_id, user_id } = req.body;
    
    if (!group_id || !user_id) {
      res.status(400).json({ error: 'Group ID and User ID are required' });
      return;
    }
    
    // Check if group exists
    const group = await db.Group.findByPk(group_id);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check if user exists
    const user = await db.User.findByPk(user_id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Check if membership already exists
    const existingMembership = await db.GroupMembership.findOne({
      where: {
        user_id,
        group_id
      }
    });
    
    if (existingMembership) {
      res.status(409).json({ error: 'User is already a member of this group' });
      return;
    }
    
    // Determine if this user should be admin (the creator of the group is admin)
    const isAdmin = group.created_by === user_id;
    
    // Create membership
    const membership = await db.GroupMembership.create({
      user_id,
      group_id,
      role: isAdmin ? 'admin' : 'member'
    });
    
    res.status(201).json({
      message: 'Successfully joined group',
      membership
    });
  } catch (err) {
    console.error('Error joining group:', err);
    res.status(500).json({ error: 'Failed to join group' });
  }
};

// Remove a user from a group
export const leaveGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { group_id, user_id } = req.body;
    
    if (!group_id || !user_id) {
      res.status(400).json({ error: 'Group ID and User ID are required' });
      return;
    }
    
    // Find membership
    const membership = await db.GroupMembership.findOne({
      where: {
        user_id,
        group_id
      }
    });
    
    if (!membership) {
      res.status(404).json({ error: 'Membership not found' });
      return;
    }
    
    // Check if the user is the group creator/admin
    const group = await db.Group.findByPk(group_id);
    if (group.created_by === user_id) {
      res.status(403).json({ error: 'Group creator cannot leave the group' });
      return;
    }
    
    // Delete membership
    await membership.destroy();
    
    res.status(200).json({
      message: 'Successfully left group'
    });
  } catch (err){
    console.error('Error leaving group:', err);
    res.status(500).json({ error: 'Failed to leave group' });
    return;
  }
};

// Get all members of a group
export const getGroupMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    
    // Check if group exists
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Find all memberships for this group with user details
    const memberships = await db.GroupMembership.findAll({
      where: { group_id: groupId },
      include: [
        {
          model: db.User,
          attributes: ['user_id', 'uname', 'email', 'profile_pic']
        }
      ]
    });
    
    res.status(200).json(memberships);
  } catch (err) {
    console.error('Error fetching group members:', err);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
};

// Check if a user is a member of a group
export const checkMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, userId } = req.params;
    
    // Log the inputs to help with debugging
    console.log(`Checking membership: groupId=${groupId}, userId=${userId}`);
    
    // Check if group exists
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      console.log(`Group with ID ${groupId} not found`);
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check if user exists
    const user = await db.User.findByPk(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found`);
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Find membership
    const membership = await db.GroupMembership.findOne({
      where: {
        user_id: userId,
        group_id: groupId
      }
    });
    
    if (membership) {
      console.log(`Membership found: ${JSON.stringify(membership)}`);
      res.status(200).json({
        isMember: true,
        role: membership.role,
        membership
      });
    } else {
      console.log('No membership found');
      res.status(200).json({
        isMember: false
      });
    }
  } catch (err) {
    console.error('Error checking membership:', err);
    res.status(500).json({ error: 'Failed to check membership', message: err instanceof Error ? err.message : String(err) });
  }
};

// Get all groups a user is a member of
export const getUserGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await db.User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Find all memberships for this user with group details
    const memberships = await db.GroupMembership.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.Group,
          attributes: ['group_id', 'name', 'description', 'image_url', 'created_at', 'created_by']
        }
      ]
    });
      // Extract groups from memberships
    const groups = memberships.map((membership: any) => membership.group);
    
    res.status(200).json(groups);
  } catch (err) {
    console.error('Error fetching user groups:', err);
    res.status(500).json({ error: 'Failed to fetch user groups' });
    return;
  }
};

// Remove a member from group (admin only)
export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, userId } = req.params;
    const { removed_by } = req.body;
    
    if (!removed_by) {
      res.status(400).json({ error: 'Removed by user ID is required' });
      return;
    }
    
    // Check if group exists
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check if the remover is an admin
    const removerMembership = await db.GroupMembership.findOne({
      where: {
        user_id: removed_by,
        group_id: groupId
      }
    });
    
    if (!removerMembership || removerMembership.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can remove members' });
      return;
    }
    
    // Find the target member
    const targetMembership = await db.GroupMembership.findOne({
      where: {
        user_id: userId,
        group_id: groupId
      }
    });
    
    if (!targetMembership) {
      res.status(404).json({ error: 'User is not a member of this group' });
      return;
    }
      // Prevent removing the group creator
    if (group.created_by === userId) {
      res.status(403).json({ error: 'Cannot remove the group creator' });
      return;
    }
    
    // Remove the member
    await targetMembership.destroy();
    
    res.status(200).json({
      message: 'Member removed from group successfully'
    });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

// Get the count of members in a group (optimized)
export const getGroupMemberCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    
    // Check if group exists
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Count memberships for this group (more efficient than fetching all)
    const memberCount = await db.GroupMembership.count({
      where: { group_id: groupId }
    });
    
    res.status(200).json({ count: memberCount });
  } catch (err) {
    console.error('Error fetching group member count:', err);
    res.status(500).json({ error: 'Failed to fetch group member count' });
  }
};
