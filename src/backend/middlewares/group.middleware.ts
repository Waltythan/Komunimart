import { Request, Response, NextFunction } from 'express';
const db = require('../../../models');

export const checkGroupMembership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the group ID from the request params
    const groupId = req.params.groupId;
    
    // Get the user ID from the authenticated user (set by authenticateJWT middleware)
    const userId = req.body.user_id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!groupId) {
      res.status(400).json({ error: 'Group ID is required' });
      return;
    }
    
    // Check if the group exists
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check if the user created the group - creators always have access
    if (group.created_by === userId) {
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
        message: 'You are not a member of this group' 
      });
      return;
    }
    
    // User is a member, proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Error checking group membership:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Middleware to check if a user is an admin of a group
export const checkGroupAdminRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.body.user_id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!groupId) {
      res.status(400).json({ error: 'Group ID is required' });
      return;
    }
    
    // Check if the group exists
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check if the user created the group - creators are always admins
    if (group.created_by === userId) {
      next();
      return;
    }
    
    // Check if the user is an admin of the group
    const membership = await db.GroupMembership.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
        role: 'admin'
      }
    });
    
    if (!membership) {
      res.status(403).json({ 
        error: 'Access denied', 
        message: 'You need admin rights to perform this action' 
      });
      return;
    }
    
    // User is an admin, proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Error checking group admin role:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
