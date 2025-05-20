import { Request, Response } from 'express';
const db = require('../../../models');

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

export const addComment = async (req: Request, res: Response) => {
  try {
    const { user_id, text, parent_id } = req.body;
    const { postId } = req.params;

    if (!user_id || !text) {
      res.status(400).json({ error: 'user_id and text are required' });
      return;
    }

    const comment = await db.Comment.create({
      author_id: user_id,
      post_id: postId,
      text,
      parent_id: parent_id || null,
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

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
