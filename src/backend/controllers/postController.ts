import { Request, Response } from 'express';
const db = require('../../../models');
import { upload, getImageUrl } from '../utils/fileUpload';
import { deleteFile } from '../utils/fileManager';

/**
 * Create a new post
 */
export const createPost = async (req: Request, res: Response): Promise<void> => {
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
};

export const getPostsByGroup = async (req: Request, res: Response): Promise<void> => {
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

export const getPostById = async (req: Request, res: Response): Promise<void> => {
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

export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await db.Comment.findAll({
      where: { post_id: req.params.postId },
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['user_id', 'uname', 'profile_pic']
        }
      ],
      order: [['created_at', 'ASC']],
    });
    
    // Process comments to include proper image URLs
    const processedComments = comments.map((comment: any) => {
      const commentData = comment.toJSON();
      return {
        ...commentData,
        image_url: getImageUrl(commentData.image_url, 'comment'),
        author: {
          ...commentData.author,
          profile_pic: getImageUrl(commentData.author.profile_pic, 'profile')
        }
      };
    });
    
    res.json(processedComments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
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
export const likeItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, likeable_id, likeable_type } = req.body;
    if (!user_id || !likeable_id || !likeable_type) {
      res.status(400).json({ error: 'user_id, likeable_id, and likeable_type are required' });
      return;
    }
    // Prevent duplicate likes
    const existing = await db.Like.findOne({ where: { user_id, likeable_id, likeable_type } });
    if (existing) {
      res.status(409).json({ error: 'Already liked' });
      return;
    }
    const like = await db.Like.create({ user_id, likeable_id, likeable_type });
    res.status(201).json(like);
  } catch (err) {
    console.error('likeItem error:', err);
    res.status(500).json({ error: 'Failed to like' });
  }
};

export const unlikeItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, likeable_id, likeable_type } = req.body;
    if (!user_id || !likeable_id || !likeable_type) {
      res.status(400).json({ error: 'user_id, likeable_id, and likeable_type are required' });
      return;
    }
    const deleted = await db.Like.destroy({ where: { user_id, likeable_id, likeable_type } });
    if (deleted) {
      res.json({ message: 'Unliked' });
      return;
    }
    res.status(404).json({ error: 'Like not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike' });
  }
};

export const getLikeCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { likeable_id, likeable_type, user_id } = req.query;
    if (!likeable_id || !likeable_type) {
      res.status(400).json({ error: 'likeable_id and likeable_type are required' });
      return;
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

// Delete a post (admin or author only)
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { deleted_by } = req.body;
    
    if (!deleted_by) {
      res.status(400).json({ error: 'Deleted by user ID is required' });
      return;
    }
    
    // Find the post
    const post = await db.Post.findByPk(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    // Check if the deleter is the author
    if (post.author_id === deleted_by) {
      // Author can delete their own post
    } else {
      // Check if the deleter is an admin of the group
      const membership = await db.GroupMembership.findOne({
        where: {
          user_id: deleted_by,
          group_id: post.group_id
        }
      });
      
      if (!membership || membership.role !== 'admin') {
        res.status(403).json({ error: 'Only the author or group admins can delete this post' });
        return;
      }
    }
    
    // Delete all related data in order (foreign key constraints)
    // 1. Delete all likes for comments on this post
    const commentRecords = await db.Comment.findAll({
      where: { post_id: postId },
      attributes: ['comment_id'],
      raw: true
    });
    const commentIds = commentRecords.map((c: any) => c.comment_id);
    if (commentIds.length > 0) {
      await db.Like.destroy({
        where: { likeable_id: commentIds, likeable_type: 'Comment' }
      });
    }
    
    // 2. Delete all comments
    await db.Comment.destroy({ where: { post_id: postId } });

    // 3. Delete all likes for this post
    await db.Like.destroy({
      where: { 
        likeable_id: postId,
        likeable_type: 'Post'
      }
    });
    
    // 4. Delete all bookmarks for this post
    await db.Bookmark.destroy({
      where: { post_id: postId }
    });
    
    // 5. Finally delete the post
    await post.destroy();
    
    res.status(200).json({
      message: 'Post deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Delete a post directly (simple version)
export const deletePostSimple = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    const post = await db.Post.findByPk(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    
    // Delete image if it exists
    if (post.image_url) {
      await deleteFile(post.image_url, 'post');
    }
    
    await post.destroy();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Delete a comment (admin or author only)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { deleted_by } = req.body;
    
    if (!deleted_by) {
      res.status(400).json({ error: 'Deleted by user ID is required' });
      return;
    }
    
    // Find the comment
    const comment = await db.Comment.findByPk(commentId, {
      include: [
        {
          model: db.Post,
          as: 'post',
          attributes: ['group_id']
        }
      ]
    });
    
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    
    // Check if the deleter is the author
    if (comment.author_id === deleted_by) {
      // Author can delete their own comment
    } else {
      // Check if the deleter is an admin of the group
      const membership = await db.GroupMembership.findOne({
        where: {
          user_id: deleted_by,
          group_id: comment.post.group_id
        }
      });
      
      if (!membership || membership.role !== 'admin') {
        res.status(403).json({ error: 'Only the author or group admins can delete this comment' });
        return;
      }
    }
    
    // Delete all related data in order (foreign key constraints)
    // 1. Delete all likes for this comment
    await db.Like.destroy({
      where: { 
        likeable_id: commentId,
        likeable_type: 'Comment'
      }
    });
    
    // 2. Delete all child comments (replies)
    await db.Comment.destroy({
      where: { parent_id: commentId }
    });
    
    // 3. Finally delete the comment
    await comment.destroy();
    
    res.status(200).json({
      message: 'Comment deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
