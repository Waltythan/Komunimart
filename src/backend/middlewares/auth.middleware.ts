import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt_helper';
// import jwt from 'jsonwebtoken';
import { UUIDTypes } from 'uuid';

interface JwtPayloadWithUserInfo {
    userId: string | UUIDTypes;
    username: string;
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
        else {
            const { userId, username } = decoded as JwtPayloadWithUserInfo;

            // Ensure req.body is defined before setting userId
            if (!req.body) {
                req.body = {};  // Initialize req.body if it's undefined
            }
            
            req.body.user_id = userId;  // Store the userId in req.body
            req.body.username = username;  // Store the username in req.body

            next(); // Continue to the next middleware or route handler
        }
    }
};