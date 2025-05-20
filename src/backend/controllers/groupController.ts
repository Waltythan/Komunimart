import { Request, Response } from 'express';
const db = require('../../../models');

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, created_by } = req.body;
    if (!name || !created_by) {
      res.status(400).json({ error: 'name and created_by are required' });
      return;
    }
    const group = await db.Group.create({ name, description, created_by });
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
