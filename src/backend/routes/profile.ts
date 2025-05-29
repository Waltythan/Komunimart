import express from 'express';
import { getCurrentUser, updateUserProfile, uploadProfilePicture } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { upload } from '../utils/fileUpload';

const router = express.Router();

// Get current user profile
router.get('/me', authenticateJWT, getCurrentUser);

// Update user profile
router.put('/update', authenticateJWT, updateUserProfile);

// Upload profile picture
router.post('/image', authenticateJWT, upload.single('image'), uploadProfilePicture);

export default router;
