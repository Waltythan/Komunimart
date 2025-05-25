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
    const { deleted_by } = req.body;
    
    if (!deleted_by) {
      res.status(400).json({ error: 'Deleted by user ID is required' });
      return;
    }
    
    // Find the group
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check if the deleter is an admin
    const membership = await db.GroupMembership.findOne({
      where: {
        user_id: deleted_by,
        group_id: groupId
      }
    });
    
    if (!membership || membership.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can delete groups' });
      return;
    }
    
    // Delete all related data in order (foreign key constraints)
    // 1. Delete all comments in posts within this group
    await db.Comment.destroy({
      where: {
        post_id: {
          [db.Sequelize.Op.in]: db.Sequelize.literal(`(SELECT post_id FROM Posts WHERE group_id = ${groupId})`)
        }
      }
    });
    
    // 2. Delete all posts in this group
    await db.Post.destroy({
      where: { group_id: groupId }
    });
    
    // 3. Delete all memberships
    await db.GroupMembership.destroy({
      where: { group_id: groupId }
    });
    
    // 4. Finally delete the group
    await group.destroy();
    
    res.status(200).json({
      message: 'Group deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};
