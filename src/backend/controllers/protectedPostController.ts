import { Request, Response } from 'express';
const db = require('../../../models');
import { getImageUrl } from '../utils/fileUpload';

/**
 * Create a new post in a group - requires group membership
 */
export const createProtectedPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, group_id } = req.body;
    const user_id = req.user?.userId;
    if (!user_id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!title || !content || !group_id || !user_id) {
      res.status(400).json({ message: 'Title, content, group_id, and user_id are required' });
      return;
    }
    
    // Check if user is a member of the group
    const group = await db.Group.findByPk(group_id);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Check for membership (or if user is the creator)
    if (group.created_by !== user_id) {
      const membership = await db.GroupMembership.findOne({
        where: {
          user_id,
          group_id
        }
      });
      
      if (!membership) {
        res.status(403).json({ 
          error: 'Access denied', 
          message: 'You must be a member of this group to create posts' 
        });
        return;
      }
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
      image_url: getImageUrl(req.file?.filename, 'post'),
      message: 'Post created successfully'
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

/**
 * Get all posts in a group - requires group membership
 */
export const getProtectedGroupPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    
    if (!groupId) {
      res.status(400).json({ message: 'Group ID is required' });
      return;
    }
    
    // Get all posts for the group with author information
    const posts = await db.Post.findAll({
      where: { group_id: groupId },
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['user_id', 'uname', 'profile_pic']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Process posts to include proper image URLs
    const processedPosts = posts.map((post: any) => {
      const postData = post.toJSON();
      return {
        ...postData,
        image_url: getImageUrl(postData.image_url, 'post'),
        author: {
          ...postData.author,
          profile_pic: getImageUrl(postData.author?.profile_pic, 'profile')
        }
      };
    });
    
    res.json(processedPosts);
  } catch (err) {
    console.error('Error getting group posts:', err);
    res.status(500).json({ error: 'Failed to get group posts' });
  }
};

/**
 * Get detail of a post by id - requires group membership
 */
export const getProtectedPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    // Find the post with its author and comments
    const post = await db.Post.findOne({
      where: { post_id: postId },
      include: [
        { 
          model: db.User, 
          as: 'author',
          attributes: ['user_id', 'uname', 'profile_pic'] 
        },
        {
          model: db.Comment,
          as: 'comments',
          include: [
            {
              model: db.User,
              as: 'author',
              attributes: ['user_id', 'uname', 'profile_pic']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });
    
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    
    // Check if user has liked this post
    const userLike = await db.Like.findOne({
      where: {
        user_id: userId,
        likeable_id: postId,
        likeable_type: 'post'
      }
    });
    
    // Get like count for this post
    const likeCount = await db.Like.count({
      where: {
        likeable_id: postId,
        likeable_type: 'post'
      }
    });
    
    // Process the post to include proper image URLs
    const postData = post.toJSON();
    
    const processedPost = {
      ...postData,
      image_url: getImageUrl(postData.image_url, 'post'),
      author: {
        ...postData.author,
        profile_pic: getImageUrl(postData.author.profile_pic, 'profile')
      },
      comments: (postData.comments || []).map((comment: any) => ({
        ...comment,
        image_url: getImageUrl(comment.image_url, 'comment'),
        author: {
          ...comment.author,
          profile_pic: getImageUrl(comment.author.profile_pic, 'profile')
        }
      })),
      likeCount,
      userLiked: !!userLike
    };
    
    res.json(processedPost);
  } catch (err) {
    console.error('Error getting post details:', err);
    res.status(500).json({ error: 'Failed to get post details' });
  }
};

/**
 * Add a comment to a post - requires group membership
 */
export const addProtectedComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const user_id = req.user?.userId;
    const { content, parent_id } = req.body;
    if (!user_id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!content || !user_id) {
      res.status(400).json({ message: 'Content and user_id are required' });
      return;
    }
    
    // Find the post 
    const post = await db.Post.findByPk(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    
    // Create the comment
    const comment = await db.Comment.create({
      post_id: postId,
      author_id: user_id,
      text: content, // Use 'text' field for the Comment model
      parent_id: parent_id || null,
      image_url: req.file ? req.file.filename : null
    });
    
    // Get the author details
    const author = await db.User.findByPk(user_id, {
      attributes: ['user_id', 'uname', 'profile_pic']
    });
    
    res.status(201).json({
      ...comment.toJSON(),
      image_url: getImageUrl(req.file?.filename, 'comment'),
      author: {
        ...author.toJSON(),
        profile_pic: getImageUrl(author.profile_pic, 'profile')
      }
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

/**
 * Like a post - requires group membership
 */
export const likeProtectedPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      res.status(400).json({ message: 'user_id is required' });
      return;
    }
    
    // Find the post
    const post = await db.Post.findByPk(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    
    // Check if user has already liked this post
    const existingLike = await db.Like.findOne({
      where: {
        user_id,
        likeable_id: postId,
        likeable_type: 'post'
      }
    });
    
    if (existingLike) {
      res.status(409).json({ message: 'You have already liked this post' });
      return;
    }
    
    // Create the like
    const like = await db.Like.create({
      user_id,
      likeable_id: postId,
      likeable_type: 'post'
    });
    
    // Get the updated like count
    const likeCount = await db.Like.count({
      where: {
        likeable_id: postId,
        likeable_type: 'post'
      }
    });
    
    res.status(201).json({
      message: 'Post liked successfully',
      like,
      likeCount
    });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

/**
 * Unlike a post - requires group membership
 */
export const unlikeProtectedPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      res.status(400).json({ message: 'user_id is required' });
      return;
    }
    
    // Find the like
    const like = await db.Like.findOne({
      where: {
        user_id,
        likeable_id: postId,
        likeable_type: 'post'
      }
    });
    
    if (!like) {
      res.status(404).json({ message: 'Like not found' });
      return;
    }
    
    // Delete the like
    await like.destroy();
    
    // Get the updated like count
    const likeCount = await db.Like.count({
      where: {
        likeable_id: postId,
        likeable_type: 'post'
      }
    });
    
    res.json({
      message: 'Post unliked successfully',
      likeCount
    });
  } catch (err) {
    console.error('Error unliking post:', err);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
};
