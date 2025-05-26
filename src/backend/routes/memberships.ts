import express from 'express';
import { 
  joinGroup, 
  leaveGroup, 
  getGroupMembers, 
  getGroupMemberCount,
  checkMembership,
  getUserGroups,
  removeMember
} from '../controllers/membershipController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// Join a group
router.post('/join', authenticateJWT, joinGroup);

// Leave a group
router.post('/leave', authenticateJWT, leaveGroup);

// Get member count of a group (optimized) - must come before the general route
router.get('/group/:groupId/count', getGroupMemberCount);

// Get all members of a group
router.get('/group/:groupId', getGroupMembers);

// Check if a user is a member of a group
router.get('/check/:groupId/:userId', checkMembership);

// Get all groups a user is a member of
router.get('/user/:userId', getUserGroups);

// Remove a member from group (admin only)
router.delete('/remove/:groupId/:userId', authenticateJWT, removeMember);

export default router;
