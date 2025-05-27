import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import fs from 'fs-extra';
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

// For debugging - log all image requests
app.use('/uploads', (req, res, next) => {
  console.log(`🖼️ Image request: ${req.path}`);
  if (!fs.existsSync(path.join(__dirname, '../../uploads', req.path))) {
    console.log(`❌ Image not found: ${req.path}`);
  }
  next();
});

// Use group routes
app.use('/groups', groupRoutes);
// Use post routes
app.use('/posts', postRoutes);
// Use membership routes
app.use('/memberships', membershipRoutes);
// Use protected post routes (requiring membership)
app.use('/protected-posts', protectedPostRoutes);

// Test endpoint to create a post with the test image (for debugging only)
app.get('/test/create-post', async (req: Request, res: Response) => {
  try {
    // First, find a group to add the post to
    const group = await db.Group.findOne();
    if (!group) {
      res.status(404).json({ message: 'No groups found' });
      return;
    }

    // Find a user to be the author
    const user = await User.findOne();
    if (!user) {
      res.status(404).json({ message: 'No users found' });
      return;
    }

    // Create a test post with our test image
    const post = await db.Post.create({
      title: 'Test Post with Image',
      content: 'This is a test post to verify image display functionality.',
      group_id: group.group_id,
      author_id: user.user_id,
      image_url: 'test-post-image.png' // This matches the file we copied earlier
    });

    res.json({ 
      message: 'Test post created successfully',
      post_id: post.post_id,
      image_url: getImageUrl(post.image_url, 'post')
    });
  } catch (error) {
    console.error('Error creating test post:', error);
    res.status(500).json({ error: 'Failed to create test post' });
  }
});

// Test login endpoint (for debugging only)
app.get('/test/login', async (req: Request, res: Response) => {
  try {
    // Find the first user
    const user = await User.findOne();
    if (!user) {
      res.status(404).json({ message: 'No users found' });
      return;
    }

    // Generate a token for testing
    const token = generateToken(user.user_id, user.uname);
    
    res.json({
      message: 'Test login successful',
      token,
      user: {
        user_id: user.user_id,
        uname: user.uname,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error in test login:', error);
    res.status(500).json({ error: 'Failed to test login' });
  }
});

// Test endpoint to add user to group (for debugging only)
app.get('/test/join-group/:groupId', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    
    // Find the first user
    const user = await User.findOne();
    if (!user) {
      res.status(404).json({ message: 'No users found' });
      return;
    }

    // Check if group exists
    const group = await db.Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if membership already exists
    const existingMembership = await db.GroupMembership.findOne({
      where: {
        user_id: user.user_id,
        group_id: groupId
      }
    });

    if (existingMembership) {
      res.json({ message: 'User already a member' });
      return;
    }

    // Create membership
    await db.GroupMembership.create({
      user_id: user.user_id,
      group_id: groupId
    });

    res.json({ 
      message: 'Membership created successfully',
      user_id: user.user_id,
      group_id: groupId
    });
  } catch (error) {
    console.error('Error creating membership:', error);
    res.status(500).json({ error: 'Failed to create membership' });
  }
});

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
