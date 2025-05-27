import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
const db = require('../../models');
const { User } = db;
const dbConfig = require('../../config/config.json').development;
import groupRoutes from './routes/groups';
import postRoutes from './routes/posts';
import { upload, getImageUrl } from './utils/fileUpload';
import path from 'path';
import { generateToken } from './utils/jwt_helper';
import membershipRoutes from './routes/memberships';
import protectedPostRoutes from './routes/protectedPosts';
import bookmarkRoutes from './routes/bookmarks';
import userRoutes from './routes/users';
// Import authenticateJWT middleware
import { authenticateJWT } from './middlewares/auth.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Register route dengan hashing password
app.post('/auth/register', async (req: Request, res: Response) => {
  const { uname, email, password } = req.body;

  if (!uname || !email || !password) {
    res.status(400).json({ message: 'All fields are required.' });
    return;
  }
  
  // Email validation using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Please enter a valid email address.' });
    return;
  }
  
  // Username must be at least 3 characters
  if (uname.length < 3) {
    res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    return;
  }

  try {
    // Check if username already exists
    const existingUsername = await User.findOne({ where: { uname } });
    if (existingUsername) {
      res.status(400).json({ message: 'Username already taken.' });
      return;
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      res.status(400).json({ message: 'Email already registered.' });
      return;
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      uname,
      email,
      password: hashedPassword, // Store hashed password
    });

    console.log('✅ User registered:', {
      id: newUser.user_id,
      uname: newUser.uname,
      email: newUser.email,
    });

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.user_id,
        uname: newUser.uname,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({
      message: 'Error creating user',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Login route
app.post('/auth/login', async (req: Request, res: Response) => {
  const { uname, email, password } = req.body;
  
  if (!password) {
    res.status(400).json({ message: 'Password is required.' });
    return;
  }

  if (!uname && !email) {
    res.status(400).json({ message: 'Username or email is required.' });
    return;
  }

  try {
    // Find user by email or username
    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (uname) {
      user = await User.findOne({ where: { uname } });
    }
    
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }    const token = generateToken(user.user_id, user.uname);
    console.log('✅ Generated token:', token);
    
    console.log('✅ Login successful:', {
      id: user.user_id,
      uname: user.uname,
      email: user.email,
    });
    
    // Return user data
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.user_id,
        uname: user.uname,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('❌ Error during login:', err);
    res.status(500).json({
      message: 'Error during login',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Get current user endpoint (protected)
app.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.body.user_id; // Set by authenticateJWT middleware
    
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'uname', 'email', 'profile_pic', 'created_at']
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({
      ...user.toJSON(),
      profile_pic: getImageUrl(user.profile_pic, 'profile')
    });
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ 
      message: 'Error fetching user data',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Update user profile endpoint (protected)
app.put('/profile/update', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.body.user_id; // Set by authenticateJWT middleware
    const { uname, email } = req.body;
    
    if (!uname && !email) {
      res.status(400).json({ message: 'At least one field (uname or email) is required' });
      return;
    }
    
    // Find the user
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
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Upload profile picture (protected)
app.post('/profile/image', authenticateJWT, upload.single('image'), async (req: Request, res: Response) => {
  console.log('🖼️ Profile image upload request received');
  console.log('📁 File:', req.file);
  console.log('👤 Request body:', req.body);
  
  if (!req.file) {
    console.log('❌ No file uploaded');
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
    try {
    // Use req.user exclusively since multer overwrites req.body
    const user_id = req.user?.userId;
    console.log('🔍 Looking for user with ID:', user_id);
    console.log('👤 req.user:', req.user);
    console.log('📝 req.body (after multer):', req.body);
    
    if (!user_id) {
      console.log('❌ No user ID found in req.user');
      res.status(401).json({ message: 'Authentication failed - user ID not found' });
      return;
    }
    
    // Update user profile
    const user = await User.findByPk(user_id);
    if (!user) {
      console.log('❌ User not found with ID:', user_id);
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    console.log('✅ User found:', user.uname);
    
    // Delete old profile picture if exists
    if (user.profile_pic) {
      try {
        const { deleteFile } = require('./utils/fileManager');
        await deleteFile(user.profile_pic, 'profile');
      } catch (deleteErr) {
        console.log('Could not delete old profile picture:', deleteErr);
      }
    }
    
    // Save filename to database
    await user.update({ profile_pic: req.file.filename });
    console.log('✅ Profile picture updated successfully');
    
    // Return success with image URL
    res.json({
      message: 'Profile picture uploaded successfully',
      image_url: getImageUrl(req.file.filename, 'profile')
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ 
      message: 'Error uploading profile picture',
      error: err instanceof Error ? err.message : String(err)
    });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Use group routes
app.use('/api/groups', groupRoutes);
// Use post routes
app.use('/api/posts', postRoutes);
// Use membership routes
app.use('/api/memberships', membershipRoutes);
// Use protected post routes (requiring membership)
app.use('/api/protected-posts', protectedPostRoutes);
// Use bookmark routes
app.use('/api/bookmarks', bookmarkRoutes);
// Use user routes
app.use('/api/users', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🗄️ Connected to DB: ${dbConfig.database} as ${dbConfig.username} @ ${dbConfig.host}:${dbConfig.port}`);
});

app.get('/debug/users', async (req, res) => {
  try {
    const users = await User.findAll({ order: [['user_id', 'DESC']] });
    console.log('🔍 Users from DB:', users.map((u: any) => u.toJSON()));
    res.json(users);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});
