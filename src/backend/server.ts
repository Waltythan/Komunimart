import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
const db = require('../../models');
const { User } = db;
const dbConfig = require('../../config/config.json').development;
import groupRoutes from './routes/groups';
import postRoutes from './routes/posts';
import { upload, getImageUrl } from './utils/fileUpload';
import membershipRoutes from './routes/memberships';
import protectedPostRoutes from './routes/protectedPosts';
import bookmarkRoutes from './routes/bookmarks';
import userRoutes from './routes/users';
import searchRoutes from './routes/search';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import { authenticateJWT } from './middlewares/auth.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Use auth routes
app.use('/auth', authRoutes);

// Use profile routes
app.use('/profile', profileRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Use group routes
app.use('/api/groups', authenticateJWT, groupRoutes);
// Use post routes
app.use('/api/posts', authenticateJWT, postRoutes);
// Use membership routes
app.use('/api/memberships', authenticateJWT, membershipRoutes);
// Use protected post routes (requiring membership)
app.use('/api/protected-posts', authenticateJWT, protectedPostRoutes);
// Use bookmark routes
app.use('/api/bookmarks', authenticateJWT, bookmarkRoutes);
// Use user routes
app.use('/api/users', authenticateJWT, userRoutes);
// Use search routes
app.use('/api/search', authenticateJWT, searchRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🗄️ Connected to DB: ${dbConfig.database} as ${dbConfig.username} @ ${dbConfig.host}:${dbConfig.port}`);
});
