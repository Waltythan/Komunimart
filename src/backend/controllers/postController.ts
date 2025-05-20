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
