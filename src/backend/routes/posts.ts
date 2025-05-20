import express from 'express';
import {
  createPost,
  getPostsByGroup,
  getPostById,
  addComment,
  getCommentsByPost
} from '../controllers/postController';

const router = express.Router();

// Create a new post in a group
router.post('/', createPost);

// Get all posts in a group
router.get('/group/:groupId', getPostsByGroup);

// Add a comment to a post
router.post('/:postId/comments', addComment);

// Get detail of a post by id
router.get('/:postId', getPostById);

// Get all comments for a post
router.get('/:postId/comments', getCommentsByPost);

export default router;
