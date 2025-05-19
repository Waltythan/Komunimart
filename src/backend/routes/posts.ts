import express from 'express';

// Fix import for models: use require and .default for compatibility
const db = require('../../../models');

const router = express.Router();

// Create a new post in a group
router.post('/', async (req, res) => {
  try {
    const { groupId, userId, title, content } = req.body;
    if (!groupId || !userId || !title || !content) {
      res.status(400).json({ error: 'groupId, userId, title, and content are required' });
    }
    const post = await db.Post.create({
      group_id: groupId,
      author_id: userId,
      title,
      content,
    });
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// (Optional) Get all posts in a group
router.get('/group/:groupId', async (req, res) => {
  try {
    const posts = await db.Post.findAll({
      where: { group_id: req.params.groupId },
      order: [['created_at', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

export default router;
