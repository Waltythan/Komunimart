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

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    // Check different common token locations
    const authHeader = req.headers['authorization'];
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];  // Token from 'Authorization: Bearer token'
    } else if (req.query && req.query.token) {
        token = req.query.token as string;  // Token from query param
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;  // Token from cookie
    }

    if (!token) {
        res.status(401).json({ message: 'Authentication required. No token provided.' });
        return;
    }

    try {
        const decoded = verifyToken(token);

        if (!decoded) {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }

        const { userId, username } = decoded as JwtPayloadWithUserInfo;

        // Store user info in req.user
        req.user = { userId, username };

        // Also set in req.body for backward compatibility
        if (!req.body) {
            req.body = {};
        }
        req.body.user_id = userId;
        req.body.username = username;

        console.log(`Authenticated request from ${username} (${userId})`);
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Authentication failed' });
        return;
    }
};