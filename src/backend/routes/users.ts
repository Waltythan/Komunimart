import express, { Request, Response, NextFunction } from 'express';
import { deleteUser } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { getImageUrl } from '../utils/fileUpload';

const router = express.Router();

// Get user details by ID (protected)
router.get('/:userId', authenticateJWT, async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		const db = require('../../../models');
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
});

// DELETE /users/:userId
router.delete('/:userId', (req: Request, res: Response, next: NextFunction) => {
	// @ts-ignore
	deleteUser(req, res, next);
});

export default router;
