import { Request, Response } from 'express';
const db = require('../../../models');
import { upload, getImageUrl } from '../utils/fileUpload';

export const createPost = async (req: Request, res: Response) => {
  try {
    const { group_id, user_id, title, content } = req.body;
    if (!group_id || !user_id || !title || !content) {
      res.status(400).json({ error: 'group_id, user_id, title, and content are required' });
      return;
    }
    const post = await db.Post.create({
      group_id,
      author_id: user_id,
      title,
      content,
    });
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const getPostsByGroup = async (req: Request, res: Response) => {
  try {
    const posts = await db.Post.findAll({
      where: { group_id: req.params.groupId },
      order: [['created_at', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await db.Post.findByPk(req.params.postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Middleware untuk route comments
export const postCommentsMiddleware = [
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const { user_id, text, parent_id } = req.body;
      const { postId } = req.params;

      if (!user_id) {
        res.status(400).json({ error: 'user_id is required' });
        return; // tambahkan return setelah response
      }

      // Allow empty text if image is provided
      if (!text && !req.file) {
        res.status(400).json({ error: 'Either text or image is required' });
        return; // tambahkan return setelah response
      }

      const comment = await db.Comment.create({
        author_id: user_id,
        post_id: postId,
        text: text || '',
        parent_id: parent_id || null,
        image_url: req.file ? req.file.filename : null,
      });

      res.status(201).json({
        ...comment.toJSON(),
        image_url: getImageUrl(req.file?.filename, 'comment'),
      });
      // Tidak perlu return setelah response terakhir
    } catch (err) {
      console.error('Error creating comment:', err);
      res.status(500).json({ error: 'Failed to create comment' });
      // Tidak perlu return setelah response terakhir
    }
  },
];

export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const comments = await db.Comment.findAll({
      where: { post_id: req.params.postId },
      order: [['created_at', 'ASC']],
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { user_id, text, parent_id } = req.body;
    const { postId } = req.params;

    if (!user_id) {
      res.status(400).json({ error: 'user_id is required' });
      return; // tambahkan return setelah response
    }

    // Allow empty text if image is provided
    if (!text && !req.file) {
      res.status(400).json({ error: 'Either text or image is required' });
      return; // tambahkan return setelah response
    }

    const comment = await db.Comment.create({
      author_id: user_id,
      post_id: postId,
      text: text || '',
      parent_id: parent_id || null,
      image_url: req.file ? req.file.filename : null,
    });

    res.status(201).json({
      ...comment.toJSON(),
      image_url: getImageUrl(req.file?.filename, 'comment'),
    });
    // Tidak perlu return setelah response terakhir
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to create comment' });
    // Tidak perlu return setelah response terakhir
  }
};

// LIKE CONTROLLERS
export const likeItem = async (req: Request, res: Response) => {
  try {
    const { user_id, likeable_id, likeable_type } = req.body;
    if (!user_id || !likeable_id || !likeable_type) {
      return res.status(400).json({ error: 'user_id, likeable_id, and likeable_type are required' });
    }
    // Prevent duplicate likes
    const existing = await db.Like.findOne({ where: { user_id, likeable_id, likeable_type } });
    if (existing) return res.status(409).json({ error: 'Already liked' });
    const like = await db.Like.create({ user_id, likeable_id, likeable_type });
    res.status(201).json(like);
  } catch (err) {
    console.error('likeItem error:', err);
    res.status(500).json({ error: 'Failed to like' });
  }
};

export const unlikeItem = async (req: Request, res: Response) => {
  try {
    const { user_id, likeable_id, likeable_type } = req.body;
    if (!user_id || !likeable_id || !likeable_type) {
      return res.status(400).json({ error: 'user_id, likeable_id, and likeable_type are required' });
    }
    const deleted = await db.Like.destroy({ where: { user_id, likeable_id, likeable_type } });
    if (deleted) return res.json({ message: 'Unliked' });
    res.status(404).json({ error: 'Like not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike' });
  }
};

export const getLikeCount = async (req: Request, res: Response) => {
  try {
    const { likeable_id, likeable_type, user_id } = req.query;
    if (!likeable_id || !likeable_type) {
      return res.status(400).json({ error: 'likeable_id and likeable_type are required' });
    }
    const count = await db.Like.count({ where: { likeable_id, likeable_type } });
    let likedByUser = false;
    if (user_id) {
      const like = await db.Like.findOne({ where: { likeable_id, likeable_type, user_id } });
      likedByUser = !!like;
    }
    res.json({ count, likedByUser });
  } catch (err) {
    console.error('getLikeCount error:', err);
    res.status(500).json({ error: 'Failed to get like count' });
  }
};
