import express from 'express';
import {
  createGroup,
  getGroups,
  getGroupById
} from '../controllers/groupController';

const router = express.Router();

// Create a new group
router.post('/', createGroup);

// Get all groups
router.get('/', getGroups);

// Get detail of a group (with posts)
router.get('/:groupId', getGroupById);

export default router;
