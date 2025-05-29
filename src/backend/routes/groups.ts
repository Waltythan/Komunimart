import express from 'express';
import { upload } from '../utils/fileUpload';
import {
  createGroupWithImage,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup
} from '../controllers/groupController';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { checkGroupAdminRole } from '../middlewares/group.middleware';

const router = express.Router();

// Create a new group
router.post('/', upload.single('image'), createGroupWithImage);

// Get all groups
router.get('/', getGroups);

// Get detail of a group (with posts)
router.get('/:groupId', getGroupById);

// Endpoint update group (admin only)
router.put('/:groupId', authenticateJWT, checkGroupAdminRole, upload.single('image'), updateGroup);

// Delete a group (admin only)
router.delete('/:groupId', authenticateJWT, checkGroupAdminRole, deleteGroup);

export default router;
