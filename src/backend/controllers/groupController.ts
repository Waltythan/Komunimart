import { Request, Response } from 'express';
const db = require('../../../models');

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, created_by } = req.body;
    if (!name || !created_by) {
      res.status(400).json({ error: 'name and created_by are required' });
      return;
    }

    // Create group
    const group = await db.Group.create({ name, description, created_by });
    
    // Automatically add the creator as an admin member
    await db.GroupMembership.create({
      user_id: created_by,
      group_id: group.group_id,
      role: 'admin'
    });
    
    res.status(201).json(group);
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const groups = await db.Group.findAll({ order: [['created_at', 'DESC']] });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const group = await db.Group.findByPk(req.params.groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    // Ambil post dalam grup
    const posts = await db.Post.findAll({
      where: { group_id: req.params.groupId },
      order: [['created_at', 'DESC']],
    });
    res.json({ ...group.toJSON(), posts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch group detail' });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { user_id, deleted_by } = req.body;
    
    // Use either the authenticated user_id from JWT or the deleted_by field
    const userId = user_id || deleted_by;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });    return;
    }
    
    // Find the group
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Delete all related data in order (foreign key constraints)
    // 1. Instead of using literal SQL, use the safer approach with Sequelize queries
    try {
      // First find all posts in this group
      const posts = await db.Post.findAll({
        where: { group_id: groupId },
        attributes: ['post_id']
      });
      
      const postIds = posts.map((post: { post_id: number }) => post.post_id);
      
      // If there are any posts, delete related comments
      if (postIds.length > 0) {
        await db.Comment.destroy({
          where: {
            post_id: {
              [db.Sequelize.Op.in]: postIds
            }
          }
        });
      }
    } catch (err) {
      console.error('Error deleting comments:', err);
      throw err; // Re-throw to be caught by the main try-catch
    }
    
    // 2. Delete all posts in this group
    try {
      await db.Post.destroy({
        where: { group_id: groupId }
      });
    } catch (err) {
      console.error('Error deleting posts:', err);
      throw err;
    }
    
    // 3. Delete all memberships
    try {
      await db.GroupMembership.destroy({
        where: { group_id: groupId }
      });
    } catch (err) {
      console.error('Error deleting group memberships:', err);
      throw err;
    }
    
    // 4. Finally delete the group
    try {
      await group.destroy();
    } catch (err) {
      console.error('Error deleting the group:', err);
      throw err;
    }
    
    res.status(200).json({
      message: 'Group deleted successfully'
    });} catch (err: any) { // Type as any for Sequelize errors
    console.error('Error deleting group:', err);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to delete group';
    if (err.name && err.name === 'SequelizeDatabaseError') {
      errorMessage += `: Database error - ${err.original?.message || 'Unknown database issue'}`;
      console.error('SQL Query that caused error:', err.sql);
    } else if (err.message) {
      errorMessage += `: ${err.message}`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      code: err.original?.code || 'UNKNOWN_ERROR'
    });
  }
};
