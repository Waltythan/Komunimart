import express from 'express';
import { getUserById, deleteUser } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// Get user details by ID
router.get('/:userId', getUserById);

// Delete a user
router.delete('/:userId', authenticateJWT, deleteUser);

export default router;
