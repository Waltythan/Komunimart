import { Request, Response, NextFunction } from 'express';
const db = require('../../../models');

// Middleware to check if a post belongs to a group and if user has access to that post
export const checkPostAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the post ID from the request params
    const postId = req.params.postId;
    
    // Get the user ID from the authenticated user (set by authenticateJWT middleware)
    const userId = req.body.user_id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!postId) {
      res.status(400).json({ error: 'Post ID is required' });
      return;
    }
      // Find the post with its group association
    const post = await db.Post.findByPk(postId);
    
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    const groupId = post.group_id;
    
    // Find the group
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ error: 'Associated group not found' });
      return;
    }
    
    // Check if the user created the group - creators always have access
    if (group.created_by === userId) {
      next();
      return;
    }
    
    // Check if the user is the author of the post
    if (post.author_id === userId) {
      next();
      return;
    }
    
    // Check if the user is a member of the group
    const membership = await db.GroupMembership.findOne({
      where: {
        user_id: userId,
        group_id: groupId
      }
    });
    
    if (!membership) {
      res.status(403).json({ 
        error: 'Access denied', 
        message: 'You must be a member of this group to access this post' 
      });
      return;
    }
    
    // User is a member, proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Error checking post access:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Middleware to check if a user can edit a post (author or group admin)
export const checkPostEditRights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the post ID from the request params
    const postId = req.params.postId;
    
    // Get the user ID from the authenticated user (set by authenticateJWT middleware)
    const userId = req.body.user_id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!postId) {
      res.status(400).json({ error: 'Post ID is required' });
      return;
    }
    
    // Find the post
    const post = await db.Post.findOne({
      where: { post_id: postId },
      include: [{ model: db.Group, as: 'group' }]
    });
    
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    // Check if the user is the author of the post
    if (post.author_id === userId) {
      next();
      return;
    }
    
    // Check if the user is the group creator
    if (post.group.created_by === userId) {
      next();
      return;
    }
    
    // Check if the user is an admin of the group
    const membership = await db.GroupMembership.findOne({
      where: {
        user_id: userId,
        group_id: post.group_id,
        role: 'admin'
      }
    });
    
    if (!membership) {
      res.status(403).json({ 
        error: 'Access denied', 
        message: 'Only the post author or group admins can edit this post' 
      });
      return;
    }
    
    // User has edit rights, proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Error checking post edit rights:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
