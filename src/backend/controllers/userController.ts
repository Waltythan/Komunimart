import { Request, Response } from 'express';
import { getImageUrl } from '../utils/fileUpload';
const db = require('../../../models');

/**
 * Get user details by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { User } = db;
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'uname', 'email', 'profile_pic', 'created_at'],
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({
      ...user.toJSON(),
      profile_pic: getImageUrl(user.profile_pic, 'profile'),
    });
  } catch (err: any) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ message: 'Error fetching user data', error: err.message || String(err) });
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    const user = await db.User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Get the currently authenticated user's profile
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { User } = db;
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'uname', 'email', 'profile_pic', 'created_at'],
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      ...user.toJSON(),
      profile_pic: getImageUrl(user.profile_pic, 'profile'),
    });
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({
      message: 'Error fetching user data',
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { uname, email } = req.body;

    if (!uname && !email) {
      res.status(400).json({ message: 'At least one field (uname or email) is required' });
      return;
    }

    // Find the user
    const { User } = db;
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if username is already taken (if updating username)
    if (uname && uname !== user.uname) {
      const existingUser = await User.findOne({ where: { uname } });
      if (existingUser) {
        res.status(400).json({ message: 'Username already taken' });
        return;
      }
    }

    // Check if email is already taken (if updating email)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }
    }

    // Update the user
    const updateData: any = {};
    if (uname) updateData.uname = uname;
    if (email) updateData.email = email;

    await user.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      user: {
        user_id: user.user_id,
        uname: user.uname,
        email: user.email,
        profile_pic: getImageUrl(user.profile_pic, 'profile'),
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({
      message: 'Error updating profile',
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * Upload a profile picture
 */
export const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    // Use req.user exclusively since multer overwrites req.body
    const user_id = req.user?.userId;

    if (!user_id) {
      res.status(401).json({ message: 'Authentication failed - user ID not found' });
      return;
    }

    // Update user profile
    const { User } = db;
    const user = await User.findByPk(user_id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Delete old profile picture if exists
    if (user.profile_pic) {
      try {
        const { deleteFile } = require('../utils/fileManager');
        await deleteFile(user.profile_pic, 'profile');
      } catch (deleteErr) {
        // Silently continue if deletion fails
      }
    }

    // Save filename to database
    await user.update({ profile_pic: req.file.filename });

    // Return success with image URL
    res.json({
      message: 'Profile picture uploaded successfully',
      image_url: getImageUrl(req.file.filename, 'profile'),
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({
      message: 'Error uploading profile picture',
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
