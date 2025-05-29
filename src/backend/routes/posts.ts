import express from 'express';
import {
  createPost,
  getPostsByGroup,
  getPostById,
  addComment,
  getCommentsByPost,
  likeItem,
  unlikeItem,
  getLikeCount,
  deletePost,
  deleteComment,
  deletePostSimple
} from '../controllers/postController';
import { upload } from '../utils/fileUpload';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// Create a new post in a group
router.post('/', upload.single('image'), createPost);

// Get all posts in a group
router.get('/group/:groupId', getPostsByGroup);

// Add a comment to a post
router.post('/:postId/comments', upload.single('image'), addComment);

// Get detail of a post by id
router.get('/:postId', getPostById);

// Get all comments for a post
router.get('/:postId/comments', getCommentsByPost);

// Like endpoints (must be above /:postId route to avoid route collision)
router.post('/likes', likeItem);
router.delete('/likes', unlikeItem);
router.get('/likes/count', getLikeCount);

// Endpoint delete post (simple version)
router.delete('/:postId', deletePostSimple);

// Delete post with admin/author check (requires authentication)
router.delete('/admin/:postId', authenticateJWT, deletePost);

// Delete comment with admin/author check
router.delete('/comments/:commentId', deleteComment);

export default router;
