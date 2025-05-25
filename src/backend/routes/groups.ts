import express from 'express';
// Import db
const db = require('../../../models');
import { upload, getImageUrl } from '../utils/fileUpload';
import {
  createGroup,
  getGroups,
  getGroupById,
  deleteGroup
} from '../controllers/groupController';
import { deleteFile } from '../utils/fileManager';

const router = express.Router();

// Create a new group
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, created_by } = req.body;
    
    if (!name || !created_by) {
      res.status(400).json({ message: 'Name and created_by are required' });
      return;
    }
    
    const group = await db.Group.create({
      name,
      description,
      created_by,
      image_url: req.file ? req.file.filename : null
    });
    
    // Automatically add the creator as an admin member
    await db.GroupMembership.create({
      user_id: created_by,
      group_id: group.group_id,
      role: 'admin'
    });
    
    res.status(201).json({
      ...group.toJSON(),
      image_url: getImageUrl(req.file?.filename, 'group')
    });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get all groups
router.get('/', getGroups);

// Get detail of a group (with posts)
router.get('/:groupId', getGroupById);

// Endpoint update group
router.put('/:groupId', upload.single('image'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Jika ada upload gambar baru dan sudah ada gambar sebelumnya, hapus yang lama
    if (req.file && group.image_url) {
      await deleteFile(group.image_url, 'group');
    }
    
    // Update group dengan data baru
    await group.update({
      name: name || group.name,
      description: description || group.description,
      image_url: req.file ? req.file.filename : group.image_url
    });
    
    res.json({
      message: 'Group updated successfully',
      group: {
        ...group.toJSON(),
        image_url: getImageUrl(group.image_url, 'group')
      }
    });
  } catch (err) {
    console.error('Error updating group:', err);
    res.status(500).json({ error: 'Failed to update group' });  }
});

// Delete a group (admin only)
router.delete('/:groupId', deleteGroup);

export default router;
