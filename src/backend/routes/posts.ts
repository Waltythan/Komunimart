import express from 'express';
import {
  createPost,
  getPostsByGroup,
  getPostById,
  addComment,
  getCommentsByPost
} from '../controllers/postController';
import { upload, getImageUrl } from '../utils/fileUpload';
import { deleteFile } from '../utils/fileManager';
// Tambahkan import db
const db = require('../../../models');

const router = express.Router();

// Create a new post in a group
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, content, group_id, user_id } = req.body;
    
    if (!title || !content || !group_id || !user_id) {
      res.status(400).json({ message: 'Title, content, group_id, and user_id are required' });
      return;
    }
    
    const post = await db.Post.create({
      title,
      content,
      group_id,
      author_id: user_id,
      image_url: req.file ? req.file.filename : null
    });
    
    res.status(201).json({
      ...post.toJSON(),
      image_url: getImageUrl(req.file?.filename, 'post')
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts in a group
router.get('/group/:groupId', getPostsByGroup);

// Add a comment to a post
router.post('/:postId/comments', upload.single('image'), addComment);

// Get detail of a post by id
router.get('/:postId', getPostById);

// Get all comments for a post
router.get('/:postId/comments', getCommentsByPost);

// Endpoint delete post
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await db.Post.findByPk(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    
    // Hapus gambar jika ada
    if (post.image_url) {
      await deleteFile(post.image_url, 'post');
    }
    
    await post.destroy();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
