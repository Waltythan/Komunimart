import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt_helper';
// import jwt from 'jsonwebtoken';
import { UUIDTypes } from 'uuid';

interface JwtPayloadWithUserInfo {
    userId: string | UUIDTypes;
    username: string;
}

// Extend Request interface to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string | UUIDTypes;
                username: string;
            };
        }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Token from 'Authorization: Bearer token'

    if (!token) {
        res.status(403).json({ message: 'No token provided' });
    }
    else {
        const decoded = verifyToken(token);

        if (!decoded) {
            res.status(401).json({ message: 'Invalid or expired token' });
        }
        else {            const { userId, username } = decoded as JwtPayloadWithUserInfo;

            // Store user info in req.user instead of req.body
            req.user = {
                userId,
                username
            };

            // Also set in req.body for backward compatibility
            if (!req.body) {
                req.body = {};
            }
            req.body.user_id = userId;
            req.body.username = username;

            next(); // Continue to the next middleware or route handler
        }
    }
};