import express from 'express';
import { upload } from '../utils/fileUpload';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { checkGroupMembership } from '../middlewares/group.middleware';
import { checkPostAccess, checkPostEditRights } from '../middlewares/post.middleware';
import { 
  createProtectedPost,
  getProtectedGroupPosts,
  getProtectedPostById,
  addProtectedComment,
  likeProtectedPost,
  unlikeProtectedPost
} from '../controllers/protectedPostController';

const router = express.Router();

// Create a new post in a group - requires group membership
router.post('/', authenticateJWT, upload.single('image'), createProtectedPost);

// Get all posts in a group - requires group membership
router.get('/group/:groupId', authenticateJWT, checkGroupMembership, getProtectedGroupPosts);

// Get detail of a post by id - requires group membership
router.get('/:postId', authenticateJWT, checkPostAccess, getProtectedPostById);

// Add a comment to a post - requires group membership
router.post('/:postId/comments', authenticateJWT, checkPostAccess, upload.single('image'), addProtectedComment);

// Like a post - requires group membership
router.post('/:postId/like', authenticateJWT, checkPostAccess, likeProtectedPost);

// Unlike a post - requires group membership
router.delete('/:postId/like', authenticateJWT, checkPostAccess, unlikeProtectedPost);

export default router;