import express, { Request, Response, NextFunction } from 'express';
import { deleteUser } from '../controllers/userController';

const router = express.Router();

// DELETE /users/:userId
router.delete('/:userId', (req: Request, res: Response, next: NextFunction) => {
	// @ts-ignore
	deleteUser(req, res, next);
});

export default router;
